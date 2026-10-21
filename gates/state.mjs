#!/usr/bin/env node
// 状态机：state.json 只记 current_phase / gate / evidence / updated_at。
import fs from 'node:fs';
import path from 'node:path';
import { now } from './lib.mjs';

const file = path.resolve('state.json');
const command = process.argv[2] || 'show';

function read() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function write(state) {
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`);
}

if (command === 'init') {
  const state = {
    current_phase: 0,
    gate: 'pending',
    evidence: [],
    updated_at: now(),
  };
  write(state);
  console.log(JSON.stringify(state, null, 2));
} else if (command === 'show') {
  const state = read();
  if (!state) {
    console.error('没有 state.json。先运行: node gates/state.mjs init');
    process.exit(2);
  }
  console.log(JSON.stringify(state, null, 2));
} else if (command === 'advance') {
  const phase = Number(process.argv[3]);
  const gate = process.argv[4] || 'pending';
  const evidence = process.argv[5];
  if (!Number.isInteger(phase) || phase < 0) {
    console.error('用法: node gates/state.mjs advance <phase> <pass|fail> [evidence-path]');
    process.exit(2);
  }
  const state = read() || { current_phase: 0, gate: 'pending', evidence: [], updated_at: now() };
  state.current_phase = phase;
  state.gate = gate;
  if (evidence) {
    state.evidence = Array.isArray(state.evidence) ? state.evidence : [];
    state.evidence.push(evidence);
  }
  state.updated_at = now();
  write(state);
  console.log(JSON.stringify(state, null, 2));
} else {
  console.error('用法: node gates/state.mjs init|show|advance <phase> [gate] [evidence]');
  process.exit(2);
}
