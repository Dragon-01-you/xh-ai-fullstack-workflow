#!/usr/bin/env node
// 破坏实验闸门：改坏一个文件里的一个字符串，跑测试，期望测试失败（退出码非 0），然后恢复。
// 通过条件：caught = true（测试抓住了变异）。AI 无法伪造 exit code。
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, writeJson, tail, now, run, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? path.resolve(args.file) : null;
const from = typeof args.from === 'string' ? args.from : null;
const to = typeof args.to === 'string' ? args.to : null;
const command = typeof args.command === 'string' ? args.command : 'npm test';
const out = typeof args.out === 'string' ? args.out : '.gates/mutation.json';
const timeoutMs = Number(args['timeout-ms'] || 300000);

if (!file || !from || !to) {
  fail('用法: node gates/gate-mutation.mjs --file src/x.js --from 原值 --to 变异值 --command "npm test"');
}
const cwd = process.cwd();
if (!file.startsWith(cwd + path.sep) && file !== cwd) {
  fail(`变异文件必须在当前项目内: ${file}`);
}
if (!fs.existsSync(file)) fail(`文件不存在: ${file}`);

const original = fs.readFileSync(file, 'utf8');
const occurrences = original.split(from).length - 1;
if (occurrences !== 1) {
  fail(`--from 必须只出现一次，当前出现 ${occurrences} 次；请换一个更精确的字符串。`);
}

const startedAt = now();
let result;
let restored = false;
try {
  fs.writeFileSync(file, original.replace(from, to));
  result = run(command, { timeoutMs });
} finally {
  fs.writeFileSync(file, original);
  restored = true;
}

const caught = result.status !== 0;
const payload = {
  gate: 'mutation',
  file: path.relative(cwd, file),
  from,
  to,
  command,
  exit_code: result.status,
  caught,
  restored,
  started_at: startedAt,
  duration_ms: result.duration_ms,
  stdout_tail: tail(result.stdout),
  stderr_tail: tail(result.stderr),
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(caught ? 0 : 1);
