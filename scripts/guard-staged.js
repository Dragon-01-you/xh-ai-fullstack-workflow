#!/usr/bin/env node
// 危险提交拦截：commit 前检查暂存区，挡住密钥、依赖、本地数据和大文件。
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let staged = [];
try {
  staged = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .split(/\r?\n/)
    .filter(Boolean);
} catch {
  console.log('guard: 不在 git 仓库里，跳过');
  process.exit(0);
}

const problems = [];
const RULES = [
  { test: (p) => /(^|\/)\.env($|\.)/.test(p) && !p.endsWith('.env.example'), why: '.env 含密钥，禁止提交' },
  { test: (p) => /(^|\/)node_modules\//.test(p), why: 'node_modules 不能提交' },
  { test: (p) => /(^|\/)data\//.test(p), why: 'data/ 是本地数据，不能提交' },
  { test: (p) => /(^|\/)\.git\//.test(p), why: '.git 内部文件不能提交' },
  { test: (p) => /(^|\/)(id_rsa|id_ed25519|.*\.pem|.*\.key)$/i.test(p), why: '疑似私钥文件' },
  { test: (p) => /\.(db|sqlite|sqlite3)$/i.test(p), why: '数据库文件不能提交' },
];
const SECRET_PATTERNS = [
  { re: /sk-[A-Za-z0-9_-]{16,}/, why: '疑似 API 密钥' },
  { re: /AKIA[0-9A-Z]{16}/, why: '疑似 AWS Access Key' },
  { re: /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/, why: '疑似私钥内容' },
];

for (const file of staged) {
  for (const rule of RULES) if (rule.test(file)) problems.push(`${file} —— ${rule.why}`);
  try {
    const full = path.join(process.cwd(), file);
    const stat = fs.statSync(full);
    if (stat.size > 1024 * 1024) {
      problems.push(`${file} —— 文件超过 1MB，确认是否该提交`);
      continue;
    }
    if (!/\.(md|txt|js|mjs|cjs|json|yml|yaml|env|example|sh)$/i.test(file)) continue;
    const isTestFixture =
      /(^|\/)(test|tests|__tests__|fixtures)\//i.test(file) ||
      /\.(test|spec)\.(c|m)?js$/i.test(file);
    if (isTestFixture) continue; // 测试夹具允许假密钥
    const text = fs.readFileSync(full, 'utf8');
    for (const { re, why } of SECRET_PATTERNS) if (re.test(text)) problems.push(`${file} —— ${why}`);
  } catch {
    /* 忽略已删除文件 */
  }
}

if (problems.length > 0) {
  console.error('⛔ pre-commit 拦截：暂存区有问题，先修正再提交');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('提示：git reset <file> 取消暂存；.env 只提交 .env.example');
  process.exit(1);
}

console.log(`guard: 暂存区检查通过（${staged.length} 个文件）`);
