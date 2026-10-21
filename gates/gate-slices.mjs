#!/usr/bin/env node
// 切片闸门：每行必须有 deterministic/exploratory + “验证：”动作；无占位符。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';
import { placeholders, hintFor } from './content.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? args.file : 'SLICES.md';
const out = typeof args.out === 'string' ? args.out : '.gates/slices.json';

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
  .filter((cells) => cells.length >= 4 && !cells[0].toLowerCase().includes('id'));

const checks = rows.map((cells) => {
  const type = cells.find((cell) => /^(deterministic|exploratory)$/i.test(cell)) || null;
  const verifyCell = cells.find((cell) => cell.includes('验证：')) || '';
  const hasVerify = verifyCell.includes('验证：') && (/`[^`]+`/.test(verifyCell) || /手工：.*(→|->)/.test(verifyCell));
  return {
    row: cells[0],
    type: type ? type.toLowerCase() : null,
    has_verify: hasVerify,
    ok: Boolean(type) && hasVerify,
  };
});
const placeholderList = placeholders(text);
const ok = rows.length > 0 && checks.every((row) => row.ok) && placeholderList.length === 0;

const payload = {
  gate: 'slices',
  file,
  rows: checks,
  placeholders: placeholderList,
  hint: hintFor(placeholderList),
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
