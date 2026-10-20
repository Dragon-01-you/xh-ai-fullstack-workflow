# 04 · TDD（Phase 6）

> 工具：**`tdd`**（红→绿循环、seam、好测试/反模式）、**`diagnosing-bugs`**（卡住时先建紧反馈回路）、**`code-review`**（实现后复审）。

## 一、一个测试 = 一个行为 + 一个预期 + 一个命令

```js
const test = require('node:test');
const assert = require('node:assert');
const { scanProject } = require('../src/scanner');

test('T1 纯静态目录 → A-static', () => {
  const result = scanProject({
    files: ['index.html', 'style.css'],
    packageJson: null,
  });
  assert.equal(result.codeForm, 'A-static');
  assert.equal(result.dataState, 'none');
});
```

命令：`npm test`（或 `node --test`）。

## 二、为什么先看红

- 红 = 功能还不存在，但测试已经会“检查”了；
- 红证明测试不是假绿；
- 红告诉你下一刀写哪个文件/函数。

## 三、对的红 vs 错的红

| 红 | 长什么样 | 怎么办 |
|---|---|---|
| **对的红** | `Cannot find module '../src/scanner'`、`actual undefined ≠ expected 'static'` | 可以去写实现 |
| **错的红** | `SyntaxError`、路径拼错、`ECONNREFUSED`、环境没装 | 先修环境/测试，不许写业务代码 |

判断口诀：**红的原因必须是“功能没做”，不能是“环境坏了”。**

## 四、假测试（Fake Green）的四种写法

```js
// ❌ 废话断言：返回报错对象也算过
assert.ok(res);

// ❌ 自己演自己：Mock 掉被测函数
const mockScan = () => ({ projectType: 'static' });
assert.equal(mockScan().projectType, 'static');

// ❌ 削足适履：代码算错，改测试预期来变绿
assert.equal(scanProject(['index.html']).projectType, 'unknown');

// ❌ 只测实现细节：改实现就红，行为没变
assert.equal(typeof internalFn, 'function');
```

**识别方法**：`git diff '*.test.js'`——如果 AI 修 bug 却改了测试预期，直接打回。

## 五、破坏实验（Mutation Test）

绿了之后，**故意改坏一行**（例如把 `A-static` 改成 `A-wrong`），再跑测试：

- 测试红 → 测试真的在检查；
- 测试还是绿 → 测试是假的，重写。

再恢复，跑绿，提交。

## 六、测试配比：3-2-1

| 类型 | 数量 | 例子 |
|---|---|---|
| 纯函数/规则单元 | 3 | 项目形态识别、规则映射 |
| 接口/安全边界 | 2 | 400 字段错误、未授权拒绝 |
| 手工端到端 | 1 | 外网打开 URL + 标题 |

**不要写**：UI 像素/布局细节；依赖外部真实网络的测试（会 flaky）；为了覆盖率的凑数测试。

## 七、循环规则

- 红之前：先确认 seam（在哪测）；
- 一次一个行为，一个测试，一次一绿；
- 不许改测试来变绿；
- 绿了先破坏实验，再提交。

