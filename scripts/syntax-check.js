#!/usr/bin/env node
// 一键 check 第一步：项目里所有 JS 文件做语法检查（不执行、不联网）。
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const SKIP_DIRS = new Set(['node_modules', '.git', 'data', 'dist', 'build', 'coverage', '.cache']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (/\.(c|m)?js$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(process.cwd());
let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed += 1;
    console.error(`❌ 语法错误：${path.relative(process.cwd(), file)}`);
    console.error(String(err.stderr || err.message).trim());
  }
}

console.log(`syntax-check: ${files.length} 个文件，${failed} 个失败`);
process.exit(failed > 0 ? 1 : 0);
