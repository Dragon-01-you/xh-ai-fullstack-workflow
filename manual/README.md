# 手工版（不依赖任何外部 skill）

每个 phase 文件已经写了“做什么”。这里是没装 Matt skills 时的替代动作：

| 阶段 | 没有外部 skill 时怎么做 |
|---|---|
| 0 聚焦 | 拿纸写六问；给 1 个真人发消息；截图。 |
| 1 环境 | `git init` + `npm run check` + 手写 AGENTS.md（地图/命令/红线）。 |
| 2 走通一条线 | 一个页面 + 一个接口 + 一次读写 + `/health`。 |
| 3 规格 | 按 `templates/SPEC.md` 七段写；读给一个用户听。 |
| 4 切片 | 按 `templates/SLICES.md` 填表；每片标 deterministic/exploratory。 |
| 5 TDD | 纯函数测试：正常/边界/错误；红→绿；改坏一行看红。 |
| 5 Spike | 90 分钟只回答一个问题；代码删掉；写 SPIKE.md。 |
| 6 证据 | 填 EVIDENCE.md；不看代码讲数据流。 |
| 7 验收 | 亲手点一遍；截图；curl。 |
| 8 部署 | 按平台文档手动部署；写 RUNBOOK；演练回滚。 |
| 9 交接 | 关掉 AI 修一个小 bug，记录。 |
| 10 复盘 | 三问 + 写出流程 diff。 |

> 外部 skill 只是加速器；没有它们，流程照样成立。
