#!/usr/bin/env node
// 解释关闸门：EVIDENCE.md 必须写清数据流、最容易坏的点、怎么发现它坏了。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { placeholders, sectionCheck } from './content.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'EVIDENCE.md';
const out = typeof args.out === 'string' ? args.out : '.gates/explain.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const specs = [
  ['## 数据流', 30],
  ['## 最容易坏的一个点', 10],
  ['## 怎么发现它坏了', 10],
];
const sections = specs.map(([heading, min]) => sectionCheck(text, heading, min));
const placeholderList = placeholders(text);
const ok = sections.every((s) => s.ok) && placeholderList.length === 0;

const payload = {
  gate: 'explain',
  file,
  sections,
  placeholders: placeholderList,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
