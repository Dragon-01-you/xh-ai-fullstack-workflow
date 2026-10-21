#!/usr/bin/env node
// 需求闸门：七问齐全、每段有实质内容、无占位符、证据文件不能太小。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { sectionCheck, placeholders, validEvidenceFiles } from './content.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'REQUIREMENTS.md';
const out = typeof args.out === 'string' ? args.out : '.gates/requirements.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const specs = [
  ['## 谁', 15],
  ['## 问题', 30],
  ['## 目标', 20],
  ['## 约束', 20],
  ['## 不做什么', 15],
  ['## 成功指标', 10],
  ['## 真实用户证据', 10],
];
const sections = specs.map(([heading, min]) => sectionCheck(text, heading, min));
const placeholderList = placeholders(text);
const evidence = validEvidenceFiles('evidence/requirements', { minImageBytes: 1024, minTextChars: 50 });
const ok = sections.every((s) => s.ok) && placeholderList.length === 0 && evidence.valid > 0;

const payload = {
  gate: 'requirements',
  file,
  sections,
  placeholders: placeholderList,
  evidence,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
