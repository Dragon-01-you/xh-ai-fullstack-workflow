#!/usr/bin/env node
// 选型闸门：STACK.md 六段齐全，且至少 2 个候选方案。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'STACK.md';
const out = typeof args.out === 'string' ? args.out : '.gates/stack.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const headings = ['## 需求约束', '## 候选方案', '## 评估维度', '## 选择', '## 代价', '## 何时改选'];
const checks = headings.map((heading) => ({ heading, ok: text.includes(heading) }));

const section = text.split('## 候选方案')[1]?.split(/\n## /)[0] || '';
const candidates = section
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^[-|]\s*\S/.test(line))
  .filter((line) => !/^\|[\s:-]+\|/.test(line) && !/^\|\s*维度/i.test(line));

const ok = checks.every((c) => c.ok) && candidates.length >= 2;
const payload = {
  gate: 'stack',
  file,
  headings: checks,
  candidate_count: candidates.length,
  candidates,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
