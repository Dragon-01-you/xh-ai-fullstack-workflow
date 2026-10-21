<!-- TEMPLATE v2.2.1 -->

# SLICES · <版本>

| ID | 行为（一句话） | 类型 | 验收 | 验证 | 风险 |
|---|---|---|---|---|---|
| S1 | <打开哪个页面 → 看到什么> | deterministic | <手工验收：做什么 → 看到什么> | 验证：`<命令>` 或 手工：<操作> → <预期> | 低 |
| S2 | <提交什么 → 返回什么> | deterministic | <接口验收> | 验证：`<命令>` | 中 |
| S3 | <要探索什么问题> | exploratory | <spike 要回答什么> | 验证：`<SPIKE.md 的检查命令>` | 低 |

> 类型只能是 `deterministic` 或 `exploratory`。
> `deterministic` = 能写出“输入 X 应该输出 Y”；`exploratory` = 写不出来，走 90 分钟 spike。
> 每一行都必须有“验证：”动作；否则 gate-slices 不过。

