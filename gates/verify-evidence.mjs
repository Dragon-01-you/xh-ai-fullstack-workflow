#!/usr/bin/env node
// 汇总闸门：按阶段检查证据；校验 provenance（脚本名/版本/时间/哈希/trusted）。
// --rerun：先按当前阶段重跑关键 gate（覆盖旧 JSON），再验证；CI 用它防旧证据。
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, writeJson, fail, sha256 } from './lib.mjs';

const gatesDir = path.dirname(fileURLToPath(import.meta.url));

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

const args = parseArgs(process.argv.slice(2));
const maxAgeDays = Number(args['max-age-days'] || 7);
const allowStale = Boolean(args['allow-stale']);
const rerun = Boolean(args.rerun);
const rerunCommands = [];

function runGateFile(name, gateArgs) {
  const result = spawnSync(process.execPath, [path.join(gatesDir, name), ...gateArgs], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  rerunCommands.push({ name, args: gateArgs, exit: result.status ?? 1 });
  return result.status ?? 1;
}

function rerunPhase(phase) {
  if (phase === 0) runGateFile('gate-requirements.mjs', ['--file', 'REQUIREMENTS.md']);
  else if (phase === 1) runGateFile('gate-stack.mjs', ['--file', 'STACK.md']);
  else if (phase === 2) runGateFile('gate-check.mjs', []);
  else if (phase === 3) runGateFile('gate-spec.mjs', ['--file', 'SPEC.md']);
  else if (phase === 4) {
    runGateFile('gate-slices.mjs', ['--file', 'SLICES.md']);
    runGateFile('gate-risk.mjs', ['--file', 'SLICES.md']);
  } else if (phase === 5) {
    runGateFile('gate-tdd.mjs', []);
    const mutation = readJson('.gates/mutation.json');
    if (mutation?.file && mutation?.from && mutation?.to) {
      runGateFile('gate-mutation.mjs', ['--file', mutation.file, '--from', mutation.from, '--to', mutation.to]);
    }
    runGateFile('gate-risk.mjs', ['--file', 'SLICES.md']);
  } else if (phase === 6) {
    rerunPhase(5);
    runGateFile('verify-evidence.mjs', ['--phase', '5']);
    runGateFile('gate-explain.mjs', ['--file', 'EVIDENCE.md']);
  } else if (phase === 7 || phase === 8) {
    const http = readJson('.gates/http.json');
    if (http?.url) {
      const httpArgs = ['--url', http.url, '--expect-status', String(http.expected_status || 200)];
      if (http.expect_text) httpArgs.push('--expect-text', http.expect_text);
      runGateFile('gate-http.mjs', httpArgs);
    }
  } else if (phase === 9) {
    runGateFile('gate-check.mjs', []);
  } else if (phase === 10) {
    runGateFile('gate-retro.mjs', ['--file', 'RETRO.md']);
  }
}

function checkProvenance(data, expectedScript) {
  if (!data || typeof data !== 'object') return { ok: false, reasons: ['缺少 JSON'] };
  const p = data.provenance;
  if (!p) return { ok: false, reasons: ['缺少 provenance（可能是手写 JSON）'] };
  const reasons = [];
  if (p.script !== expectedScript) reasons.push(`script 应为 ${expectedScript}，实际 ${p.script}`);
  if (!p.version) reasons.push('provenance 缺少 version');
  const finished = Date.parse(p.finished_at);
  const started = Date.parse(p.started_at);
  if (Number.isNaN(finished)) reasons.push('finished_at 无效');
  else {
    const age = Date.now() - finished;
    if (age < 0) reasons.push('finished_at 在未来');
    if (age > maxAgeDays * 24 * 60 * 60 * 1000 && !allowStale) {
      reasons.push(`证据超过 ${maxAgeDays} 天（可加 --allow-stale 临时放行）`);
    }
  }
  if (Number.isNaN(started) || started > finished) reasons.push('started_at 无效或晚于 finished_at');
  const copy = { ...data };
  delete copy.provenance;
  if (sha256(JSON.stringify(copy)) !== p.payload_sha256) reasons.push('payload 哈希不匹配（内容被改过）');
  return { ok: reasons.length === 0, reasons };
}

let phase = Number(args.phase);
if (!Number.isInteger(phase)) {
  const state = readJson('state.json');
  phase = state ? Number(state.current_phase) : NaN;
}
if (!Number.isInteger(phase)) fail('没有 state.json；请用 --phase <n> 指定阶段。');

if (rerun) rerunPhase(phase);

const checks = [];
function add(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail ?? null });
}
function addGate(name, file, expectedScript, predicate) {
  const data = readJson(file);
  const prov = checkProvenance(data, expectedScript);
  add(name, prov.ok && predicate(data), { file, reasons: prov.reasons });
  return data;
}

if (phase === 0) {
  addGate('requirements', '.gates/requirements.json', 'gates/gate-requirements.mjs', (d) => d.ok === true);
} else if (phase === 1) {
  addGate('stack', '.gates/stack.json', 'gates/gate-stack.mjs', (d) => d.ok === true);
} else if (phase === 2) {
  addGate('check', '.gates/check.json', 'gates/gate-check.mjs', (d) => d.exit_code === 0 && d.trusted === true);
} else if (phase === 3) {
  addGate('spec', '.gates/spec.json', 'gates/gate-spec.mjs', (d) => d.ok === true);
} else if (phase === 4) {
  addGate('slices', '.gates/slices.json', 'gates/gate-slices.mjs', (d) => d.ok === true);
  addGate('risk', '.gates/risk.json', 'gates/gate-risk.mjs', (d) => d.ok === true);
} else if (phase === 5) {
  const tdd = addGate('tdd', '.gates/tdd.json', 'gates/gate-tdd.mjs', (d) => d.exit_code === 0 && d.trusted === true);
  const mutation = addGate(
    'mutation',
    '.gates/mutation.json',
    'gates/gate-mutation.mjs',
    (d) => d.caught === true && d.trusted === true && d.syntax_ok !== false,
  );
  add('命令一致', Boolean(tdd?.command && tdd.command === mutation?.command), {
    tdd: tdd?.command || null,
    mutation: mutation?.command || null,
  });
  addGate('risk', '.gates/risk.json', 'gates/gate-risk.mjs', (d) => d.ok === true);
  checks.push({ name: 'spike (optional)', ok: true, detail: readJson('.gates/spike.json')?.ok === true });
} else if (phase === 6) {
  add('phase 5 已通过', readJson('.gates/verify-5.json')?.ok === true, '.gates/verify-5.json');
  addGate('explain', '.gates/explain.json', 'gates/gate-explain.mjs', (d) => d.ok === true);
} else if (phase === 7) {
  addGate('http', '.gates/http.json', 'gates/gate-http.mjs', (d) => d.ok === true);
} else if (phase === 8) {
  addGate('http', '.gates/http.json', 'gates/gate-http.mjs', (d) => d.ok === true);
  add('runbook', fs.existsSync('RUNBOOK.md'), 'RUNBOOK.md');
} else if (phase === 9) {
  addGate('check', '.gates/check.json', 'gates/gate-check.mjs', (d) => d.exit_code === 0 && d.trusted === true);
  add('no-ai-drill', fs.existsSync('no-ai-drill.md'), 'no-ai-drill.md');
} else if (phase === 10) {
  addGate('retro', '.gates/retro.json', 'gates/gate-retro.mjs', (d) => d.ok === true);
} else {
  fail(`未知阶段: ${phase}`);
}

const ok = checks.every((c) => c.ok);
const payload = {
  gate: 'verify-evidence',
  phase,
  rerun,
  rerun_commands: rerunCommands,
  max_age_days: maxAgeDays,
  stale_allowed: allowStale,
  checks,
  ok,
};
writeJson(`.gates/verify-${phase}.json`, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
