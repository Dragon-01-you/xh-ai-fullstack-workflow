#!/usr/bin/env node
// 聚焦闸门：检查 FOCUS.md 六问是否齐全，以及 evidence/focus/ 是否有真实用户证据。
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'FOCUS.md';
const out = typeof args.out === 'string' ? args.out : '.gates/focus.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const headings = ['## 谁', '## 现在怎么凑合', '## 可观察行为', '## 最便宜实验', '## 放弃信号', '## 真实用户证据'];
const checks = headings.map((heading) => ({ heading, ok: text.includes(heading) }));
const evidenceDir = path.resolve('evidence/focus');
let evidenceCount = 0;
if (fs.existsSync(evidenceDir)) {
  evidenceCount = fs.readdirSync(evidenceDir, { recursive: true }).filter((name) => fs.statSync(path.join(evidenceDir, name)).isFile()).length;
}
const ok = checks.every((c) => c.ok) && evidenceCount > 0;

const payload = {
  gate: 'focus',
  file,
  headings: checks,
  evidence_files: evidenceCount,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
