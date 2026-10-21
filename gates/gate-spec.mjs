#!/usr/bin/env node
// 规格闸门：五段齐全、至少 3 条验收、每条验收必须挂“验证：”动作、无占位符。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { acceptanceCheck, placeholders } from './content.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'SPEC.md';
const out = typeof args.out === 'string' ? args.out : '.gates/spec.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const headings = ['## 问题', '## 用户故事', '## 验收', '## 不做什么', '## 失败'];
const checks = headings.map((heading) => ({ heading, ok: text.includes(heading) }));
const acceptance = acceptanceCheck(text, { minItems: 3, minChars: 15 });
const hasFailure = /失败/.test(text);
const placeholderList = placeholders(text);
const ok = checks.every((c) => c.ok) && acceptance.ok && hasFailure && placeholderList.length === 0;

const payload = {
  gate: 'spec',
  file,
  headings: checks,
  acceptance,
  has_failure: hasFailure,
  placeholders: placeholderList,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
