#!/usr/bin/env node
// 探索闸门：SPIKE.md 四段齐全，且有“删除证明”。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'SPIKE.md';
const out = typeof args.out === 'string' ? args.out : '.gates/spike.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const headings = ['## 问题', '## 我学到什么', '## 保留什么', '## 删除证明'];
const checks = headings.map((heading) => ({ heading, ok: text.includes(heading) }));
const hasDeletion = /删除|已删|删掉/.test(text);
const ok = checks.every((c) => c.ok) && hasDeletion;

const payload = {
  gate: 'spike',
  file,
  headings: checks,
  has_deletion_proof: hasDeletion,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
