# Phase 6 · 证据闸门 + 解释关

> 目标：把“AI 说完成了”换成“机器证据 + 你能讲出来”。

## 机器证据（先过 Phase 5）

```bash
node gates/verify-evidence.mjs --phase 5
# 检查：.gates/tdd.json exit_code=0；.gates/mutation.json caught=true；provenance 有效
# 产物：.gates/verify-5.json
```

规则：**不信 AI 的报告，只看 exit code / JSON 字段 / provenance。**

## 解释关（人不看代码，自己讲）

在 `EVIDENCE.md` 里写清这个切片的数据流：

```
从哪个文件/入口进
→ 经过哪几个函数
→ 落哪张表/存哪
→ 失败时怎么返回/回滚
```

写完再对照代码。写不出来 = 没懂，不许进 Phase 7。

## 机器闸门

```bash
node gates/gate-explain.mjs --file EVIDENCE.md
# 检查：数据流/最容易坏的点/怎么发现它坏了；每段有实质内容；无占位符
# 产物：.gates/explain.json

node gates/verify-evidence.mjs --phase 6
# 检查：Phase 5 已通过 + 解释关通过

node gates/verify-evidence.mjs --phase 5 --rerun
# CI/隔周回来：先重跑 tdd/mutation/risk，再验证，防旧证据
```

## 人的闸门

- 能不看代码讲清数据流。
- 能指出“最容易坏的一个点”和“怎么发现它坏了”。
- 能解释测试里每个断言在检查什么。

## 失败分支

- 讲不出来 → 回 Phase 5 重做/让 AI 用大白话讲一遍，再自己复述。
- 证据文件缺失 → 重跑 gate，不许手写 JSON。

## 时间盒

20–30 分钟。
