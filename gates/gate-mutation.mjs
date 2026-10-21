#!/usr/bin/env node
// 破坏实验闸门：改坏一个源文件里的字符串，跑测试，期望测试失败，然后恢复。
// 防绕过：命令锁定、禁止变异测试文件、变异后先做 node --check（语法坏不算 caught）。
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, writeJson, tail, now, run, fail, resolveCommand } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = typeof args.file === 'string' ? path.resolve(args.file) : null;
const from = typeof args.from === 'string' ? args.from : null;
const to = typeof args.to === 'string' ? args.to : null;
const out = typeof args.out === 'string' ? args.out : '.gates/mutation.json';
const timeoutMs = Number(args['timeout-ms'] || 300000);

if (!file || !from || !to) {
  fail('用法: node gates/gate-mutation.mjs --file src/x.js --from 原值 --to 变异值');
}
if (from === to) fail('--from 和 --to 不能相同，否则不是有效变异。');

const cwd = process.cwd();
if (!file.startsWith(cwd + path.sep) && file !== cwd) {
  fail(`变异文件必须在当前项目内: ${file}`);
}
const rel = path.relative(cwd, file);
if (/(^|[\\/])(test|tests|__tests__|fixtures)([\\/]|$)/i.test(rel) || /\.(test|spec)\.(c|m)?js$/i.test(rel)) {
  fail('不允许变异测试文件/夹具；只能变异 src 等源码。');
}
if (!fs.existsSync(file)) fail(`文件不存在: ${file}`);

// 命令锁定 + 与 gate-tdd 交叉指纹
const resolved = resolveCommand('test', args);
let tddCommand = null;
try {
  tddCommand = JSON.parse(fs.readFileSync('.gates/tdd.json', 'utf8')).command || null;
} catch {
  tddCommand = null;
}
if (tddCommand && tddCommand !== resolved.command) {
  fail(`mutation 命令必须与 gate-tdd 相同：tdd="${tddCommand}"，mutation="${resolved.command}"。`);
}

const original = fs.readFileSync(file, 'utf8');
const occurrences = original.split(from).length - 1;
if (occurrences !== 1) {
  fail(`--from 必须只出现一次，当前出现 ${occurrences} 次；请换一个更精确的字符串。`);
}

const startedAt = now();
let result = { status: 1, stdout: '', stderr: '', duration_ms: 0 };
let syntaxOk = true;
let restored = false;
try {
  fs.writeFileSync(file, original.replace(from, to));
  const ext = path.extname(file).toLowerCase();
  if (['.js', '.mjs', '.cjs'].includes(ext)) {
    const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    syntaxOk = syntax.status === 0;
  }
  if (syntaxOk) result = run(resolved.command, { timeoutMs });
} finally {
  fs.writeFileSync(file, original);
  restored = true;
}

const caught = syntaxOk && result.status !== 0;
const payload = {
  gate: 'mutation',
  file: rel,
  from,
  to,
  command: resolved.command,
  command_source: resolved.command_source,
  trusted: resolved.trusted,
  tdd_command: tddCommand,
  syntax_ok: syntaxOk,
  test_exit: result.status,
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
