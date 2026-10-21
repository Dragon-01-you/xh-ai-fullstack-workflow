#!/usr/bin/env node
// 高风险闸门：SLICES.md 里标了“高/high”的切片，必须在 RISK.md 里有回滚预案 + 人工确认。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'SLICES.md';
const riskFile = typeof args.risk === 'string' ? args.risk : 'RISK.md';
const out = typeof args.out === 'string' ? args.out : '.gates/risk.json';

let text;
try {
  text = readText(file);
} catch {
  fail(`读不到 ${file}`);
}

const rows = text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith('|') && !/^\|[\s:-]+\|/.test(line))
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
  .filter((cells) => cells.length >= 5 && !cells[0].toLowerCase().includes('id'));

const highRisk = rows
  .map((cells) => ({ id: cells[0], risk: cells[cells.length - 1] || '' }))
  .filter((row) => /高|high/i.test(row.risk));

let riskText = '';
try {
  riskText = readText(riskFile);
} catch {
  riskText = '';
}

const missing = [];
if (highRisk.length > 0 && !riskText) missing.push(`缺少 ${riskFile}`);
if (riskText) {
  for (const row of highRisk) if (!riskText.includes(row.id)) missing.push(`${row.id} 未在 ${riskFile} 出现`);
  if (!/回滚/.test(riskText)) missing.push('RISK.md 缺少“回滚预案”');
  if (!/人工确认/.test(riskText)) missing.push('RISK.md 缺少“人工确认”');
}

const ok = highRisk.length === 0 || missing.length === 0;
const payload = { gate: 'risk', file, risk_file: riskFile, high_risk: highRisk, missing, ok };
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
