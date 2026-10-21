#!/usr/bin/env node
// 可复现审计：不需要外部服务，自动建临时项目，跑 4 组测试并打印 PASS/FAIL。
// 用法：node audit/run-audit.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gatesDir = path.join(skillRoot, 'gates');
const templatesDir = path.join(skillRoot, 'templates');
const fixtureDir = path.join(skillRoot, 'audit', 'fixtures', 'filled');
const results = [];

function mkTemp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function copyContents(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyContents(from, to);
    else fs.copyFileSync(from, to);
  }
}

function gate(name, args, cwd) {
  const result = spawnSync(process.execPath, [path.join(gatesDir, name), ...args], {
    cwd,
    encoding: 'utf8',
  });
  return result.status ?? 1;
}

// gate-http 需要父进程的临时服务器在监听；spawnSync 会阻塞父进程事件循环，
// 导致子进程连不上，所以这一条必须用异步 spawn。
function gateAsync(name, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(gatesDir, name), ...args], {
      cwd,
      stdio: 'ignore',
    });
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

function record(name, expected, exitCode) {
  const ok = expected === 'pass' ? exitCode === 0 : exitCode !== 0;
  results.push({ name, expected, exitCode, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  exit=${exitCode}  (expect ${expected})`);
}

function templateTest() {
  const dir = mkTemp('xh-audit-template-');
  fs.mkdirSync(path.join(dir, 'evidence', 'requirements'), { recursive: true });
  for (const file of ['REQUIREMENTS.md', 'STACK.md', 'SPEC.md', 'SLICES.md', 'SPIKE.md', 'RETRO.md', 'EVIDENCE.md']) {
    fs.copyFileSync(path.join(templatesDir, file), path.join(dir, file));
  }
  fs.writeFileSync(path.join(dir, 'evidence', 'requirements', 'one-byte.txt'), 'x');
  const checks = [
    ['gate-requirements.mjs', ['--file', 'REQUIREMENTS.md']],
    ['gate-stack.mjs', ['--file', 'STACK.md']],
    ['gate-spec.mjs', ['--file', 'SPEC.md']],
    ['gate-slices.mjs', ['--file', 'SLICES.md']],
    ['gate-spike.mjs', ['--file', 'SPIKE.md']],
    ['gate-retro.mjs', ['--file', 'RETRO.md']],
    ['gate-explain.mjs', ['--file', 'EVIDENCE.md']],
  ];
  for (const [name, args] of checks) record(`模板原样:${name}`, 'fail', gate(name, args, dir));
  fs.rmSync(dir, { recursive: true, force: true });
}

async function filledTest() {
  const dir = mkTemp('xh-audit-filled-');
  copyContents(fixtureDir, dir);
  copyContents(path.join(skillRoot, 'scripts'), path.join(dir, 'scripts'));
  copyContents(path.join(skillRoot, '.githooks'), path.join(dir, '.githooks'));
  spawnSync('git', ['init', '-q'], { cwd: dir, encoding: 'utf8' });
  spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: dir, encoding: 'utf8' });

  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.end('ok');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/health`;

  try {
    const content = [
      ['gate-requirements.mjs', ['--file', 'REQUIREMENTS.md']],
      ['gate-stack.mjs', ['--file', 'STACK.md']],
      ['gate-spec.mjs', ['--file', 'SPEC.md']],
      ['gate-slices.mjs', ['--file', 'SLICES.md']],
      ['gate-spike.mjs', ['--file', 'SPIKE.md']],
      ['gate-retro.mjs', ['--file', 'RETRO.md']],
      ['gate-explain.mjs', ['--file', 'EVIDENCE.md']],
    ];
    for (const [name, args] of content) record(`填好内容:${name}`, 'pass', gate(name, args, dir));

    const exec = [
      ['gate-check.mjs', ['--command', 'npm test']],
      ['gate-tdd.mjs', ['--command', 'npm test']],
      ['gate-mutation.mjs', ['--file', 'src/math.js', '--from', 'a + b', '--to', 'a - b', '--command', 'npm test']],
      ['gate-guard.mjs', []],
      ['gate-http.mjs', ['--url', url, '--expect-status', '200', '--expect-text', 'ok']],
    ];
    for (const [name, args] of exec) {
      const code = name === 'gate-http.mjs' ? await gateAsync(name, args, dir) : gate(name, args, dir);
      record(`执行闸门:${name}`, 'pass', code);
    }

    for (let phase = 0; phase <= 10; phase += 1) {
      record(`verify phase ${phase}`, 'pass', gate('verify-evidence.mjs', ['--phase', String(phase)], dir));
    }

    // 手写 JSON：不带 provenance，必须失败
    fs.writeFileSync(path.join(dir, '.gates', 'tdd.json'), JSON.stringify({ gate: 'tdd', exit_code: 0 }));
    record('手写 tdd.json 被拒', 'fail', gate('verify-evidence.mjs', ['--phase', '5'], dir));

    // 恢复真 tdd.json
    record('恢复真 tdd.json', 'pass', gate('gate-tdd.mjs', ['--command', 'npm test'], dir));

    // 篡改真 JSON：哈希必须不匹配
    const tddPath = path.join(dir, '.gates', 'tdd.json');
    const tdd = JSON.parse(fs.readFileSync(tddPath, 'utf8'));
    tdd.command = 'echo fake';
    fs.writeFileSync(tddPath, JSON.stringify(tdd, null, 2));
    record('篡改 tdd.json 被拒', 'fail', gate('verify-evidence.mjs', ['--phase', '5'], dir));
    record('再次恢复真 tdd.json', 'pass', gate('gate-tdd.mjs', ['--command', 'npm test'], dir));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log('=== 1. 模板原样（应全部 FAIL） ===');
templateTest();
console.log('\n=== 2. 填好内容（应全部 PASS） ===');
await filledTest();

const failed = results.filter((r) => !r.ok);
console.log(`\n=== 总结：${results.length - failed.length}/${results.length} 通过，${failed.length} 失败 ===`);
if (failed.length > 0) {
  for (const f of failed) console.log(`- FAIL: ${f.name} (exit ${f.exitCode}, expected ${f.expected})`);
  process.exit(1);
}
