# BACKLOG

## v2.3（下一轮）

- [ ] `--rerun`：CI 里不信任旧 JSON，重跑 `gate-tdd` / `gate-mutation` / `gate-http`，用于关键路径。
- [ ] `gate-risk`：高风险切片（认证/支付/生产数据/密钥）必须有回滚/备份预案，否则 Phase 5 不放行。
- [ ] 内容语义的进一步校验（目前只能查“有没有填、有没有验证动作”，不能判断写得对不对）。
- [ ] `platforms/` 的 `last_verified` 自动过期提醒（目前是文档规则，需要人/CI 检查）。

## 已完成

- v2.2：P0 修复（verify bug、scripts+gate-guard、内容闸门、provenance）+ 可复现审计 34/34。
- v2.1：重排阶段（需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署 → 交接 → 复盘）。
- v2.0：机器闸门 + 人的闸门 + 状态机 + 分型 + 平台知识外置。
