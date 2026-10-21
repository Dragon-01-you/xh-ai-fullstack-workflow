# BACKLOG

## 下一轮（v2.4）

- [ ] 内容语义的进一步校验（目前只能查“有没有填、有没有验证动作”，不能判断写得对不对）。
- [ ] `platforms/` 的 `last_verified` 自动过期提醒（目前是文档规则，需要人/CI 检查）。
- [ ] `gates/` 脚本本身的运行时保护（目前靠 `git diff gates/` + 分支保护 + 人工审计）。
- [ ] 可选的 `--explain`：闸门红时输出更具体的修复建议（现在已有 `hint` 字段）。

## 已完成

- v2.3.0：`--rerun` + `gate-risk`；审计 44/44。
- v2.2.1：命令锁定、mutation 防绕过、占位符误报修复、7 天新鲜度、版本号统一、THREAT-MODEL、CHANGELOG；审计 41/41。
- v2.2：P0 修复（verify bug、scripts+gate-guard、内容闸门、provenance）+ 可复现审计 34/34。
- v2.1：重排阶段（需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署 → 交接 → 复盘）。
- v2.0：机器闸门 + 人的闸门 + 状态机 + 分型 + 平台知识外置。
