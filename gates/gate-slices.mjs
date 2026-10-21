#!/usr/bin/env node
// 切片闸门：SLICES.md 的每一行都必须标 deterministic 或 exploratory，且有验收列。
import { parseArgs, writeJson, readText, fail } from './lib.mjs';

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
  const type = cells.find((cell) => /^(deterministic|exploratory)$/i.test(cell));
  return { row: cells[0], type: type ? type.toLowerCase() : null, cells: cells.length };
});
const ok = rows.length > 0 && checks.every((row) => row.type !== null);

const payload = {
  gate: 'slices',
  file,
  rows: checks,
  ok,
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
