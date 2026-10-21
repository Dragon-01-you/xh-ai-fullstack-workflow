// 共享工具：参数解析、JSON 写入（自动加 provenance）、命令执行、输出截断。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i += 1;
      } else {
        out[key] = true;
      }
    } else {
      out._.push(arg);
    }
  }
  return out;
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function sha256(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

// 所有 gate JSON 自动带 provenance：脚本名、命令、时间、exit_code、payload 哈希。
// 目的是挡住“不跑脚本、手写 JSON”；它不防“连脚本一起改”，那靠 git diff 人工兜底。
export function writeJson(file, value) {
  if (value && value.gate && !value.provenance) {
    const core = { ...value };
    const hash = sha256(JSON.stringify(core));
    value.provenance = {
      script: value.gate === 'verify-evidence' ? 'gates/verify-evidence.mjs' : `gates/gate-${value.gate}.mjs`,
      command: value.command || value.url || value.file || '',
      cwd: process.cwd(),
      started_at: value.started_at || now(),
      finished_at: now(),
      exit_code: typeof value.exit_code === 'number' ? value.exit_code : (value.ok ? 0 : 1),
      payload_sha256: hash,
    };
  }
  ensureDir(path.dirname(path.resolve(file)));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function tail(value, max = 4000) {
  const text = String(value ?? '');
  return text.length > max ? text.slice(-max) : text;
}

export function now() {
  return new Date().toISOString();
}

export function run(command, options = {}) {
  const started = Date.now();
  const result = spawnSync(command, {
    shell: true,
    encoding: 'utf8',
    cwd: options.cwd || process.cwd(),
    timeout: options.timeoutMs || 300000,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    duration_ms: Date.now() - started,
    error: result.error ? String(result.error.message || result.error) : null,
  };
}

export function readText(file) {
  return fs.readFileSync(path.resolve(file), 'utf8');
}

export function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}
