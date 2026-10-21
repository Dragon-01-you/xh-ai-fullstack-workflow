// 共享工具：参数解析、JSON 写入、命令执行、输出截断。
import fs from 'node:fs';
import path from 'node:path';
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

export function writeJson(file, value) {
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

export function hasAll(text, headings) {
  return headings.map((heading) => ({ heading, ok: text.includes(heading) }));
}

export function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}
