# Phase 4 · 切片 + 分型

> 目标：把 spec 切成 3–5 个能独立验收的小片，并给每片定“怎么测”。
> **先分型，再决定 TDD 还是 spike。**

## 切片表（`templates/SLICES.md`）

| ID | 行为（一句话） | 类型 | 验收 | 风险 |
|---|---|---|---|---|
| S1 | 打开首页 → 看到表单 | deterministic | 手工：打开 / 看到 3 个字段 | 低 |
| S2 | 提交 → 存库 → 返回 200 | deterministic | 手工 + 接口测试 | 中 |
| S3 | 状态模型怎么设计 | exploratory | spike 结论 | 低 |

## 分型判断（每片问一句）

> **我能写出“输入 X 应该输出 Y”吗？**

- **能** → `deterministic` → 走 TDD（Phase 5A）。
- **不能** → `exploratory` → 走 90 分钟 spike（Phase 5B）。

## 机器闸门

```bash
node gates/gate-slices.mjs --file SLICES.md
# 检查：每行有类型（deterministic/exploratory）和验收
# 产物：.gates/slices.json
```

## 人的闸门

- 每片能不能独立演示/验收？
- 高风险片（认证/支付/生产数据/密钥）标出来了吗？

## 失败分支

- 切片太大 → 继续切，直到一片一天能做完。
- 分型犹豫 → 先按 exploratory 做 30 分钟 spike，再决定。

## 时间盒

30–45 分钟。
