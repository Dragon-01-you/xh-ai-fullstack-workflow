# SLICES · v0
| ID | 行为 | 类型 | 验收 | 验证 | 风险 |
|---|---|---|---|---|---|
| S1 | 打开首页看到标题和表单 | deterministic | 打开首页看到三个字段 | 验证：手工：打开 / → 看到三个字段 | 低 |
| S2 | 提交有效数据返回 200 | deterministic | 提交后看到结果 | 验证：`node --test test/api.test.js` | 高 |
| S3 | 状态模型怎么存 | exploratory | spike 回答存内存还是文件 | 验证：`node gates/gate-spike.mjs --file SPIKE.md` | 低 |

