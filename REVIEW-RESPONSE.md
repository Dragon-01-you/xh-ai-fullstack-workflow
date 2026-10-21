# 对评审的回应（v2）

> 评审的核心结论：**有闸门，但闸门没牙。** v2 不增加阶段，先把“牙齿”装上。

| # | 评审点 | v2 的改动 | 落在哪 |
|---|---|---|---|
| 1 | 9/10 闸门是自评 | 自评闸门换成脚本证据：`gate-requirements / gate-stack / gate-check / gate-guard / gate-spec / gate-slices / gate-tdd / gate-mutation / gate-http / gate-spike / gate-explain / gate-retro`，全部写 `.gates/*.json`，用 exit code 表态 | `gates/` |
| 2 | 只关心交付，不关心人会 | Phase 6 解释关（不看代码讲数据流）+ Phase 9 无 AI 演练；`no-ai-drill.md` | `phases/06`、`phases/09` |
| 3 | 需求默认成立 | Phase 0 需求理解 + 问题证伪：真实用户、可观察行为、最便宜实验、放弃信号；`gate-requirements` 检查七问 + 用户证据 | `phases/00` |
| 4 | TDD 硬套探索任务 | Phase 4 分型：能写“输入 X→输出 Y”才 TDD；不能走 90 分钟 spike，代码必须删 | `phases/04`、`phases/05` |
| 5 | 复盘产散文 | Phase 10 必须产出流程 diff；`gate-retro` 检查 diff/补丁 | `phases/10` |
| 6 | 平台知识写死 | 平台事实外置到 `platforms/`，`last_verified` + `source` + `recheck`；超 90 天先复核 | `platforms/` |
| 7 | 单文件 70 个勾会跳读 | SKILL.md 瘦身；阶段拆文件；`state.json` 只记一行状态 | `SKILL.md`、`phases/`、`gates/state.mjs` |
| 8 | **流程顺序错（新增）** | 需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署；walking skeleton 放进 Phase 5，不是独立阶段 | `SKILL.md`、`phases/` |
| A | 没有逃生舱 | 三振规则：2 次失败停、3 次回滚；高风险人工确认 | `SKILL.md`、各 phase |
| B | 外部依赖太重 | 每个 phase 有手工版；`manual/README.md` | `manual/` |
| C | 没有上下文隔离 | 切片按 branch/worktree 做（phase 05 建议）；Phase 7 回归 | `phases/05` |
| D | 没有风险分级 | 低/中/高，高风险必须人工确认 + 回滚预案 | `phases/08` |
| E | 验收无 CI | Phase 7 的 smoke 命令可进 CI；`gate-http` 可重跑 | `phases/07` |
| F | 时间估算失真 | 每个 phase 的时间盒按真实范围写（不写“两小时全流程”） | `phases/` |

## v2.2（B 修复）已做

**可复现审计：`node audit/run-audit.mjs` → 41/41 PASS**（见 `AUDIT-REPORT.md`）。

| 审计点 | 修法 |
|---|---|
| P0 ① verify-evidence 把 `spike (optional)` 算进必过项，TDD 路径被拦死 | `spike` 不再进 `checks.every`；TDD 路径只需 `tdd` + `mutation`，实测无 `spike.json` 也能过 |
| P0 ② v2 删掉 `scripts/`，流程还在引用 | 恢复 `scripts/syntax-check.js`、`scripts/guard-staged.js`、`.githooks/pre-commit`；新增 `gate-guard` 在临时仓库实测“拦 `.env`、放行正常文件” |
| P0 ③ 原样复制模板 = 全绿 | 内容闸门加：占位符检测、分段最小字数、每条验收必须挂 `验证：` 动作、证据文件不能太小；模板原样跑现在会红 |
| P0 ④ `.gates/*.json` 可手写 | 所有 gate JSON 自动加 `provenance`（脚本名/命令/时间/exit_code/payload 哈希）；`verify-evidence` 校验来源、时间新鲜度、哈希 |
| P1 Phase 6 空阶段 | Phase 6 改用 `gate-explain`：检查 `EVIDENCE.md` 的数据流/易坏点/发现方式，并前置要求 `verify-5` 已通过 |
| P1 `--expect-text` 没暴露 | Phase 7/8 文档加上 `--expect-text`，防止白屏 200 |

## v2.2.1（命令锁定 + 误报修复）

| 审计点 | 修法 |
|---|---|
| provenance 防手写，但 `--command "exit 0"` 可绕过 | `gate-check` / `gate-tdd` 默认只用 `package.json` scripts；任意命令需 `--allow-arbitrary-command`，写 `trusted:false`，verify 拒绝；mutation 命令必须与 tdd 相同 |
| mutation 可变异成语法错 / 变异测试文件 | 变异后 `node --check`（语法坏不算 caught）；禁止 `test/tests/__tests__/fixtures` 和 `*.test.js` |
| 占位符误伤 `示例`、`xxx`、`<200>` | 去掉通用词；`<...>` 只匹配标识符风格；模板加 `<!-- TEMPLATE v2.2.1 -->` 指纹 |
| 24h 新鲜度过严 | 默认 7 天；`--max-age-days` / `--allow-stale` |
| 版本号打架 | SKILL frontmatter `version: 2.2.1`；provenance 写 `version`；新增 `CHANGELOG.md` |
| CI mutation 被注释 | `templates/ci-check.yml` 默认跑 mutation（参数需替换） |
| Phase 8 无 `--expect-text` | Phase 8 机器闸门与文档都要求 `--expect-text` |
| 没有对抗性文档 | 新增 `gates/THREAT-MODEL.md` |

## 还没完全解决的（诚实清单）

- `gate-requirements` / `gate-spec` 能查“有没有填、有没有验证动作”，但**不能判断内容是否真的正确**；最终仍靠人。
- `gate-mutation` 只能做单字符串替换；复杂变异仍需人设计。
- `platforms/` 的 `last_verified` 只是提醒，不是自动复核。
- `--rerun`（CI 里重跑 critical gates）还没内置；目前默认只校验 provenance。
- 风险分级已经写进 Phase 4/5/7/8，但还没有独立的 `gate-risk`。
- 三振回滚已改成“先 stash/WIP 再 reset”，但仍需人确认。

## 和 v1 最大的区别

v1：**流程是主角，部署项目是背景** → 实际写成了部署项目说明书。
v2：**流程是主角，部署项目只是 `examples/deploy-helper.md` 的一个案例**；核心在 `phases/` + `gates/`。
