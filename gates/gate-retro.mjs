#!/usr/bin/env node
// 复盘闸门：RETRO.md 三问齐全，且必须写出流程改动（diff/补丁）。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'RETRO.md';
const out = typeof args.out === 'string' ? args.out : '.gates/retro.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const headings = ['## 哪不好', '## 为什么', '## 流程改动'];
const checks = headings.map((heading) => ({ heading, ok: text.includes(heading) }));
const hasDiff = /```diff|^diff |补丁|PROCESS-PATCH/i.test(text);
const ok = checks.every((c) => c.ok) && hasDiff;

const payload = {
  gate: 'retro',
  file,
  headings: checks,
  has_process_diff: hasDiff,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
