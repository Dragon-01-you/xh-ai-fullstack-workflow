#!/usr/bin/env node
// 需求闸门：REQUIREMENTS.md 七问齐全，且 evidence/requirements/ 有真实用户证据。
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'REQUIREMENTS.md';
const out = typeof args.out === 'string' ? args.out : '.gates/requirements.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const headings = ['## 谁', '## 问题', '## 目标', '## 约束', '## 不做什么', '## 成功指标', '## 真实用户证据'];
const checks = headings.map((heading) => ({ heading, ok: text.includes(heading) }));
const evidenceDir = path.resolve('evidence/requirements');
let evidenceCount = 0;
if (fs.existsSync(evidenceDir)) {
  evidenceCount = fs
    .readdirSync(evidenceDir, { recursive: true })
    .filter((name) => fs.statSync(path.join(evidenceDir, name)).isFile()).length;
}
const ok = checks.every((c) => c.ok) && evidenceCount > 0;

const payload = {
  gate: 'requirements',
  file,
  headings: checks,
  evidence_files: evidenceCount,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
