#!/usr/bin/env node
// 规格闸门：检查 SPEC.md 的必填段落、验收条数、失败路径。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

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
const acceptance = (text.match(/^\s*-\s*\[[ x]\]/gm) || []).length;
const hasFailure = /失败/.test(text);
const ok = checks.every((c) => c.ok) && acceptance >= 3 && hasFailure;

const payload = {
  gate: 'spec',
  file,
  headings: checks,
  acceptance_count: acceptance,
  has_failure: hasFailure,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
