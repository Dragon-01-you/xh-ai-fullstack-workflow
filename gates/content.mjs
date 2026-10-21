// 内容校验：占位符、分段字数、验收必须挂“验证：”动作、证据文件不能太小。
import fs from 'node:fs';
import path from 'node:path';

const PLACEHOLDER_PATTERNS = [
  /<\s*[^>\n]{1,60}\s*>/g,
  /\bTODO\b/gi,
  /\bTBD\b/gi,
  /\bxxx\b/gi,
  /项目名/g,
  /<角色>/g,
  /示例/g,
];

export function placeholders(text) {
  const found = new Set();
  for (const re of PLACEHOLDER_PATTERNS) {
    const matches = String(text).match(re) || [];
    for (const match of matches) found.add(match);
  }
  return [...found];
}

export function section(text, heading) {
  const index = String(text).indexOf(heading);
  if (index < 0) return '';
  const rest = String(text).slice(index + heading.length);
  const next = rest.search(/\n## /);
  return next < 0 ? rest : rest.slice(0, next);
}

export function chars(text) {
  return String(text).replace(/\s/g, '').length;
}

export function sectionCheck(text, heading, minChars) {
  const body = section(text, heading);
  const hits = placeholders(body);
  return {
    heading,
    chars: chars(body),
    min_chars: minChars,
    placeholders: hits,
    ok: chars(body) >= minChars && hits.length === 0,
  };
}

export function acceptanceCheck(text, options = {}) {
  const minItems = options.minItems ?? 3;
  const minChars = options.minChars ?? 15;
  const body = section(text, '## 验收');
  const items = body
    .split(/\r?\n/)
    .filter((line) => /^\s*-\s*\[[ x]\]/.test(line))
    .map((line) => line.replace(/^\s*-\s*\[[ x]\]\s*/, ''));
  const checks = items.map((item) => {
    const verify = item.split('验证：')[1] || '';
    const hasCommand = /`[^`]+`/.test(verify);
    const hasManual = /手工：/.test(verify) && /(→|->)/.test(verify);
    return {
      item,
      chars: chars(item),
      has_verify: item.includes('验证：'),
      has_action: hasCommand || hasManual,
      ok: chars(item) >= minChars && item.includes('验证：') && (hasCommand || hasManual),
    };
  });
  return {
    count: checks.length,
    items: checks,
    ok: checks.length >= minItems && checks.every((c) => c.ok),
  };
}

export function validEvidenceFiles(dir, options = {}) {
  const minImageBytes = options.minImageBytes ?? 1024;
  const minTextChars = options.minTextChars ?? 50;
  const root = path.resolve(dir);
  if (!fs.existsSync(root)) return { dir, total: 0, valid: 0, files: [] };
  const files = [];
  for (const name of fs.readdirSync(root, { recursive: true })) {
    const full = path.join(root, name);
    if (!fs.statSync(full).isFile()) continue;
    const stat = fs.statSync(full);
    const ext = path.extname(name).toLowerCase();
    const image = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
    let ok = false;
    if (image) ok = stat.size >= minImageBytes;
    else {
      const text = fs.readFileSync(full, 'utf8');
      ok = stat.size >= minTextChars || chars(text) >= minTextChars;
    }
    files.push({ file: path.relative(root, full), bytes: stat.size, ok });
  }
  return { dir, total: files.length, valid: files.filter((f) => f.ok).length, files };
}
