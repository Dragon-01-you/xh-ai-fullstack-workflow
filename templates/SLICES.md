# SLICES · <版本>

| ID | 行为（一句话） | 类型 | 验收 | 风险 |
|---|---|---|---|---|
| S1 | 打开首页 → 看到表单 | deterministic | 手工：打开 / 看到 3 个字段 | 低 |
| S2 | 提交 → 存库 → 返回 200 | deterministic | 手工 + 接口测试 | 中 |
| S3 | 状态模型怎么设计 | exploratory | spike 结论 | 低 |

> 类型只能是 `deterministic` 或 `exploratory`。
> `deterministic` = 能写出“输入 X 应该输出 Y”；`exploratory` = 写不出来，走 90 分钟 spike。
