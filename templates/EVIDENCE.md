# EVIDENCE · <切片>

| 需求 | 测试 | 代码路径 | 手工证据 | 线上行为 | 状态 |
|---|---|---|---|---|---|
| S1 | test/x.test.js::… | src/x.js | evidence/acceptance/s1.png | 外网 GET / 200 | ✅/🟠 |
| S2 | … | … | evidence/acceptance/s2.txt | … | … |

## 数据流（解释关，不看代码写）

从哪个文件/入口进 → 经过哪几个函数 → 落哪张表 → 失败时怎么返回/回滚。

## 最容易坏的一个点

## 怎么发现它坏了
