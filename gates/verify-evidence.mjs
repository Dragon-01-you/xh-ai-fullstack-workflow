#!/usr/bin/env node
// 汇总闸门：按当前阶段检查必需的证据文件，全部通过才算过。
import fs from 'node:fs';
import { parseArgs, writeJson, fail } from './lib.mjs';

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
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
  checks.push({ name, ok: Boolean(ok), detail: detail || null });
}

if (phase === 0) {
  const data = readJson('.gates/focus.json');
  add('focus', data?.ok === true, data);
} else if (phase === 1) {
  const data = readJson('.gates/check.json');
  add('check', data?.exit_code === 0, data?.exit_code);
} else if (phase === 2) {
  const data = readJson('.gates/http.json');
  add('http', data?.ok === true, data);
} else if (phase === 3) {
  const data = readJson('.gates/spec.json');
  add('spec', data?.ok === true, data);
} else if (phase === 4) {
  const data = readJson('.gates/slices.json');
  add('slices', data?.ok === true, data);
} else if (phase === 5 || phase === 6) {
  const tdd = readJson('.gates/tdd.json');
  const mutation = readJson('.gates/mutation.json');
  const spike = readJson('.gates/spike.json');
  add('tdd', tdd?.exit_code === 0, tdd?.exit_code);
  add('mutation', mutation?.caught === true, mutation?.caught);
  add('spike (optional)', spike?.ok === true, spike?.ok);
  // 通过条件：TDD+破坏实验都过，或者 spike 过。
  checks.push({ name: 'either', ok: (tdd?.exit_code === 0 && mutation?.caught === true) || spike?.ok === true, detail: null });
} else if (phase === 7 || phase === 8) {
  const data = readJson('.gates/http.json');
  add('http', data?.ok === true, data);
} else if (phase === 9) {
  const data = readJson('.gates/check.json');
  add('check', data?.exit_code === 0, data?.exit_code);
  add('no-ai-drill', fs.existsSync('no-ai-drill.md'), 'no-ai-drill.md');
} else if (phase === 10) {
  const data = readJson('.gates/retro.json');
  add('retro', data?.ok === true, data);
} else {
  fail(`未知阶段: ${phase}`);
}

const ok = checks.every((c) => c.ok);
const payload = { gate: 'verify-evidence', phase, checks, ok };
writeJson(`.gates/verify-${phase}.json`, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
