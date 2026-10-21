#!/usr/bin/env node
// 复盘闸门：三问齐全、每段有实质内容、有流程 diff/补丁、无占位符。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { placeholders, sectionCheck, hintFor } from './content.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'RETRO.md';
const out = typeof args.out === 'string' ? args.out : '.gates/retro.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const specs = [
  ['## 哪不好', 10],
  ['## 为什么', 10],
  ['## 流程改动', 10],
];
const sections = specs.map(([heading, min]) => sectionCheck(text, heading, min));
const hasDiff = /```diff|^diff |补丁|PROCESS-PATCH/im.test(text);
const placeholderList = placeholders(text);
const ok = sections.every((s) => s.ok) && hasDiff && placeholderList.length === 0;

const payload = {
  gate: 'retro',
  file,
  sections,
  has_process_diff: hasDiff,
  placeholders: placeholderList,
  hint: hintFor(placeholderList),
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
