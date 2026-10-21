#!/usr/bin/env node
// HTTP 闸门：访问 URL，校验状态码（可选文本），写 .gates/http.json。
import { parseArgs, writeJson, now, fail } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const url = typeof args.url === 'string' ? args.url : null;
const expected = Number(args['expect-status'] || 200);
const expectText = typeof args['expect-text'] === 'string' ? args['expect-text'] : null;
const out = typeof args.out === 'string' ? args.out : '.gates/http.json';
const timeoutMs = Number(args['timeout-ms'] || 15000);

if (!url) fail('用法: node gates/gate-http.mjs --url https://example.com/health --expect-status 200');

const startedAt = now();
const started = Date.now();
let status = 0;
let ok = false;
let body = '';
let error = null;
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  status = res.status;
  body = await res.text();
  ok = status === expected && (!expectText || body.includes(expectText));
} catch (err) {
  error = String(err?.message || err);
}

const payload = {
  gate: 'http',
  url,
  expected_status: expected,
  expect_text: expectText,
  status,
  ok,
  duration_ms: Date.now() - started,
  started_at: startedAt,
  error,
  body_tail: body.slice(-2000),
};
writeJson(out, payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
