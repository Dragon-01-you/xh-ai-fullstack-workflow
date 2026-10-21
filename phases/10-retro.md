# Phase 10 · 复盘 / 改流程

> 目标：让下一次跑得更好。**没有 diff 的复盘是日记。**

## 三问

1. 这次哪一步最烂？（具体到阶段/命令/文件）
2. 为什么？（概念没懂 / 流程缺一环 / 工具不好用 / 时间不够）
3. 下次改哪一条？（必须落到流程文件）

## 产出（两样都要）

1. `RETRO.md`：三问 + 一条改进。
2. **流程 diff**：对 `SKILL.md` / `phases/` / `gates/` 的具体修改；或者 `PROCESS-PATCH.md` 里写清“改哪个文件、改成什么”。

```diff
- Phase 5 闸门：AI 报告“破坏实验通过”
+ Phase 5 闸门：gates/gate-mutation.mjs 的 caught=true
```

## 机器闸门

```bash
node gates/gate-retro.mjs --file RETRO.md
# 检查：三问 + 流程改动 + diff/补丁
# .gates/retro.json
```

## 人的闸门

- 这条改动，下一次真的能拦住同样的问题吗？
- 如果不能，重写。

## 时间盒

30 分钟。

## 每月一次

把重复出现的坑合并成一条新 gate，或删掉一条没用的步骤。流程要变短，不是变长。
