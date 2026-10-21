#!/usr/bin/env node
// 探索闸门：四段齐全、每段有实质内容、有删除证明、无占位符。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { placeholders, sectionCheck, hintFor } from './content.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'SPIKE.md';
const out = typeof args.out === 'string' ? args.out : '.gates/spike.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const specs = [
  ['## 问题', 10],
  ['## 我学到什么', 20],
  ['## 保留什么', 5],
  ['## 删除证明', 5],
];
const sections = specs.map(([heading, min]) => sectionCheck(text, heading, min));
const hasDeletion = /删除|已删|删掉/.test(text);
const placeholderList = placeholders(text);
const ok = sections.every((s) => s.ok) && hasDeletion && placeholderList.length === 0;

const payload = {
  gate: 'spike',
  file,
  sections,
  has_deletion_proof: hasDeletion,
  placeholders: placeholderList,
  hint: hintFor(placeholderList),
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
