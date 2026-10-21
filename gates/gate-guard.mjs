#!/usr/bin/env node
// 护栏闸门：在临时仓库里真的 stage 一个 .env，验证 guard-staged.js 会拦住；
// 再 stage 一个正常文件，验证会放行；同时检查 core.hooksPath 已指向 .githooks。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { writeJson, fail, tail } from './lib.mjs';

const guard = path.resolve('scripts/guard-staged.js');
if (!fs.existsSync(guard)) fail('缺少 scripts/guard-staged.js；先把护栏脚本补回来。');

function git(cwd, args) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xh-guard-'));
let blocked;
let allowed;
try {
  fs.copyFileSync(guard, path.join(temp, 'guard.js'));
  fs.writeFileSync(path.join(temp, '.env'), 'SECRET=1\n');
  fs.writeFileSync(path.join(temp, 'README.md'), '# demo\n');
  git(temp, ['init', '-q']);
  git(temp, ['add', '.env']);
  blocked = spawnSync(process.execPath, [path.join(temp, 'guard.js')], { cwd: temp, encoding: 'utf8' });
  git(temp, ['rm', '--cached', '-q', '.env']);
  git(temp, ['add', 'README.md']);
  allowed = spawnSync(process.execPath, [path.join(temp, 'guard.js')], { cwd: temp, encoding: 'utf8' });
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

const hook = git(process.cwd(), ['config', 'core.hooksPath']);
const hookPath = (hook.stdout || '').trim();
const blockedOk = blocked.status !== 0;
const allowedOk = allowed.status === 0;
const hookOk = hook.status === 0 && hookPath === '.githooks';
const ok = blockedOk && allowedOk && hookOk;

const payload = {
  gate: 'guard',
  command: 'scripts/guard-staged.js',
  blocked_exit: blocked.status,
  blocked_ok: blockedOk,
  allowed_exit: allowed.status,
  allowed_ok: allowedOk,
  hook_path: hookPath,
  hook_ok: hookOk,
  blocked_output_tail: tail(blocked.stdout + blocked.stderr),
  allowed_output_tail: tail(allowed.stdout + allowed.stderr),
  ok,
};
writeJson('.gates/guard.json', payload);
console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
