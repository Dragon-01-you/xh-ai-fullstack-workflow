#!/usr/bin/env node
// 选型闸门：六段齐全、至少 2 个候选、每个候选有实质内容、无占位符。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { chars, placeholders, section } from './content.mjs';

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

const sectionText = section(text, '## 候选方案');
const candidates = sectionText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^-\s+\S/.test(line))
  .filter((line) => !/^-\s*候选/.test(line));

const candidateChecks = candidates.map((line) => ({
  line,
  chars: chars(line),
  ok: chars(line) >= 20,
}));
const placeholderList = placeholders(text);
const ok = checks.every((c) => c.ok) && candidateChecks.length >= 2 && candidateChecks.every((c) => c.ok) && placeholderList.length === 0;

const payload = {
  gate: 'stack',
  file,
  headings: checks,
  candidates: candidateChecks,
  placeholders: placeholderList,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
