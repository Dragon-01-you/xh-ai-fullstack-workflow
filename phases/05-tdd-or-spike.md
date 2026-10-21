# Phase 5 · TDD 或探索（分两条路）

> 进来先看 Phase 4 的分型：`deterministic` 走 5A，`exploratory` 走 5B。**不许混。**

## 5A · TDD（deterministic）

### 一句话

> 测试不是“证明代码对”，是“先写检查单，再看代码有没有做到”。红 = 还没做到；绿 = 做到了。

### 步骤（一片一次）

1. 选一个纯函数/接口作为 seam（输入 → 输出，不碰 UI/网络/数据库）。
2. 写第一条测试（正常情况，一个断言）。
3. 跑 → **红**；红的原因必须是“功能没做”，不是语法/路径错。
4. 写最少实现 → **绿**。
5. 写第二条（边界/失败），重复 3–4。
6. 跑破坏实验：改坏一行 → 测试必须红 → 改回来。
7. 提交。

### 例子（真实项目里的 scanner）

```js
const test = require('node:test');
const assert = require('node:assert');
const { scanProject } = require('../src/scanner');

test('纯静态目录 → A-static', () => {
  const result = scanProject({
    files: ['index.html', 'style.css'],
    packageJson: null,
  });
  assert.equal(result.codeForm, 'A-static');
});
```

第一次跑：`Cannot find module '../src/scanner'` = **对的红**（功能还没做）。
写最小实现后：`✔` = **绿**。

### 机器闸门

```bash
node gates/gate-tdd.mjs --command "npm test"
# .gates/tdd.json：exit_code 必须 0

node gates/gate-mutation.mjs \
  --file src/scanner.js --from "A-static" --to "A-wrong" \
  --command "npm test"
# .gates/mutation.json：caught 必须 true（改坏后测试必须失败）
```

### 人的闸门

- 看 `.gates/mutation.json` 的 `caught: true`，不是听 AI 说“我改坏了”。
- 自己讲一遍：这个测试在检查什么？红了说明什么？

### 不许

- 改测试预期让它变绿。
- 测实现细节（函数内部怎么写的）。
- Mock 掉被测对象。
- 一次测整个页面。

## 5B · Spike（exploratory）

### 规则

- 限时 **90 分钟**，只回答一个问题。
- 代码是**一次性**的：结束必须删掉，只留 `SPIKE.md`。
- 产出：`SPIKE.md`（问题 / 我学到什么 / 保留什么 / 删除证明）。
- 不写测试、不做完整功能、不留技术债。

### 机器闸门

```bash
node gates/gate-spike.mjs --file SPIKE.md
# .gates/spike.json：检查四段齐全 + “删除证明”
```

### 人的闸门

- 你能否用一句话说出“我知道了什么”？
- 代码真的删了吗？（`git status` 里没有 spike 代码）

## 失败分支

- TDD 红得不对（环境坏）→ 先修环境，不写业务。
- Spike 超时 → 停，写结论；不许把 spike 代码留成产品。
- 同一片失败 2 次 → 回 Phase 4 重切；3 次 → `git checkout .` 回上一个绿 commit。

## 时间盒

- TDD：一片 1–3 小时。
- Spike：严格 90 分钟。
