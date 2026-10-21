#!/usr/bin/env node
// TDD 闸门：跑测试命令，把 exit code 写进 .gates/tdd.json。
import { parseArgs, writeJson, tail, now, run } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const command = typeof args.command === 'string' ? args.command : 'npm test';
const out = typeof args.out === 'string' ? args.out : '.gates/tdd.json';
const timeoutMs = Number(args['timeout-ms'] || 300000);

const startedAt = now();
const result = run(command, { timeoutMs });
const payload = {
  gate: 'tdd',
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
