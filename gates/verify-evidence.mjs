#!/usr/bin/env node
// 汇总闸门：按当前阶段检查必需的证据文件；校验 provenance（脚本名/时间/哈希），
// 不再把“spike optional”算进必过项；Phase 6 检查解释关 + Phase 5 已通过。
import fs from 'node:fs';
import { parseArgs, writeJson, fail, sha256 } from './lib.mjs';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function checkProvenance(data, expectedScript) {
  if (!data || typeof data !== 'object') return { ok: false, reasons: ['缺少 JSON'] };
  const p = data.provenance;
  if (!p) return { ok: false, reasons: ['缺少 provenance（可能是手写 JSON）'] };
  const reasons = [];
  if (p.script !== expectedScript) reasons.push(`script 应为 ${expectedScript}，实际 ${p.script}`);
  const finished = Date.parse(p.finished_at);
  const started = Date.parse(p.started_at);
  if (Number.isNaN(finished)) reasons.push('finished_at 无效');
  else {
    const age = Date.now() - finished;
    if (age < 0) reasons.push('finished_at 在未来');
    if (age > 24 * 60 * 60 * 1000) reasons.push('证据超过 24 小时');
  }
  if (Number.isNaN(started) || started > finished) reasons.push('started_at 无效或晚于 finished_at');
  const copy = { ...data };
  delete copy.provenance;
  if (sha256(JSON.stringify(copy)) !== p.payload_sha256) reasons.push('payload 哈希不匹配（内容被改过）');
  return { ok: reasons.length === 0, reasons };
}

const args = parseArgs(process.argv.slice(2));
let phase = Number(args.phase);
if (!Number.isInteger(phase)) {
  const state = readJson('state.json');
  phase = state ? Number(state.current_phase) : NaN;
}
if (!Number.isInteger(phase)) fail('没有 state.json；请用 --phase <n> 指定阶段。');

const checks = [];
function add(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail ?? null });
}
function addGate(name, file, expectedScript, predicate) {
  const data = readJson(file);
  const prov = checkProvenance(data, expectedScript);
  add(name, prov.ok && predicate(data), { file, reasons: prov.reasons });
}

if (phase === 0) {
  addGate('requirements', '.gates/requirements.json', 'gates/gate-requirements.mjs', (d) => d.ok === true);
} else if (phase === 1) {
  addGate('stack', '.gates/stack.json', 'gates/gate-stack.mjs', (d) => d.ok === true);
} else if (phase === 2) {
  addGate('check', '.gates/check.json', 'gates/gate-check.mjs', (d) => d.exit_code === 0);
} else if (phase === 3) {
  addGate('spec', '.gates/spec.json', 'gates/gate-spec.mjs', (d) => d.ok === true);
} else if (phase === 4) {
  addGate('slices', '.gates/slices.json', 'gates/gate-slices.mjs', (d) => d.ok === true);
} else if (phase === 5) {
  addGate('tdd', '.gates/tdd.json', 'gates/gate-tdd.mjs', (d) => d.exit_code === 0);
  addGate('mutation', '.gates/mutation.json', 'gates/gate-mutation.mjs', (d) => d.caught === true);
  // spike 是可选路径，不参与必过项；存在就记录，不存在不影响。
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
  addGate('check', '.gates/check.json', 'gates/gate-check.mjs', (d) => d.exit_code === 0);
  add('no-ai-drill', fs.existsSync('no-ai-drill.md'), 'no-ai-drill.md');
} else if (phase === 10) {
  addGate('retro', '.gates/retro.json', 'gates/gate-retro.mjs', (d) => d.ok === true);
} else {
  fail(`未知阶段: ${phase}`);
}

const ok = checks.every((c) => c.ok);
const payload = { gate: 'verify-evidence', phase, checks, ok };
writeJson(`.gates/verify-${phase}.json`, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
