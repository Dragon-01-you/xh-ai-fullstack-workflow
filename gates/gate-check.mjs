#!/usr/bin/env node
// 环境闸门：跑一条检查命令，把 exit code 和输出写进 .gates/check.json。
import { parseArgs, writeJson, tail, now, run } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const command = typeof args.command === 'string' ? args.command : 'npm run check';
const out = typeof args.out === 'string' ? args.out : '.gates/check.json';
const timeoutMs = Number(args['timeout-ms'] || 300000);

const startedAt = now();
const result = run(command, { timeoutMs });
const payload = {
  gate: 'check',
  command,
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
