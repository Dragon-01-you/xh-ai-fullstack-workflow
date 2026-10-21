#!/usr/bin/env node
// TDD 闸门：跑测试命令，把 exit code 写进 .gates/tdd.json。
// 命令锁定：默认只用 package.json scripts.test / npm test；任意命令需 --allow-arbitrary-command 且 trusted:false。
import { parseArgs, writeJson, tail, now, run, resolveCommand } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const resolved = resolveCommand('test', args);
const command = resolved.command;
const out = typeof args.out === 'string' ? args.out : '.gates/tdd.json';
const timeoutMs = Number(args['timeout-ms'] || 300000);

const startedAt = now();
const result = run(command, { timeoutMs });
const payload = {
  gate: 'tdd',
  command,
  command_source: resolved.command_source,
  trusted: resolved.trusted,
  exit_code: result.status,
  started_at: startedAt,
  duration_ms: result.duration_ms,
  error: result.error,
  stdout_tail: tail(result.stdout),
  stderr_tail: tail(result.stderr),
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(result.status);
