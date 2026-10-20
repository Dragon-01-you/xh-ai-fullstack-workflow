# 06 · 每一步用哪把“枪”（工具映射）

> 这些工具来自 **Matt Pocock 的 skills**：https://github.com/mattpocock/skills
> 装了就用名字调用；没装就按阶段说明手工做。**工具只加速，不改变闸门。**

## 主流程（一张图）

```
grill-with-docs → to-spec → to-tickets → implement（每 ticket）
                                      ↘ implement-spec（整 spec）
                                          ↓ tdd
                                     code-review → retro
```

贯穿全程：`ask-matt`（路由）、`handoff`（阶段边界）、`wait-what`（听不懂时）、`teach`（学东西）、`writing-*`（写洞见）。

## 阶段 → 工具 → 怎么调用

| 阶段 | 用哪把枪 | 什么时候 | 产出 | 调用话术 |
|---|---|---|---|---|
| **0 开工对话** | `grilling` / `grill-with-docs` | 需求还模糊、你还没想清楚 | 设计树 + 决策 | 「用 grilling 访谈我：每轮 frontier 提问，事实你查，决策我拍板；一次只问一个二选一。」 |
| **1 搭环境** | `writing-for-agents` | 写 `AGENTS.md` / `CLAUDE.md` 时 | 规则书 | 「用 writing-for-agents 的规范帮我写 AGENTS.md，<100 行，只放地图/命令/红线。」 |
| **2 扫描** | 本 skill 的 `scripts/` + 项目里的 scanner | 一开工 | 项目画像 | 「按 02-scan-and-prerequisites 的字段扫描这个目录，输出 JSON。」 |
| **3 前置条件** | `research` + `wizard` + `to-questionnaire` | 查官方价格/政策；账号/实名/面板步骤 | 前置条件表 + 向导 | 「用 research 查 CloudBase 免费额度和实名要求，只引官方来源；用 wizard 生成注册/实名向导。」 |
| **4 需求 / spec** | `grill-with-docs` → `to-spec` + `domain-modeling` | 需求定了、要落成 spec | GLOSSARY + ADR + spec | 「先 grill-with-docs 澄清术语和取舍，再 to-spec 生成 spec；验收由我改。」 |
| **5 架构** | `codebase-design` + `prototype` | 模块/接口/seam 拿不准；设计问题纸上想不清 | 深模块设计 / 一次性原型 | 「用 codebase-design 审模块深度和 seam；这个状态模型用 prototype 做个一次性原型验证。」 |
| **6 TDD** | `tdd` + `diagnosing-bugs` | 写测试/红绿循环；卡在 bug 上 | 3–5 条测试 + 红绿记录 | 「调用 tdd：先确认 seam，再写测试；红得对再实现；卡住用 diagnosing-bugs。」 |
| **7 实现** | `implement` / `implement-spec` + `handoff` | 按 ticket 实现；换会话/目录 | 代码 + RUNLOG | 「用 implement 做这个 ticket；阶段结束用 handoff 写交接文件。」 |
| **8 验收** | `code-review` + `wait-what` | 验收前复审；报告看不懂 | 双轴报告 + 人话版 | 「用 code-review 双轴审 diff；报告我看不懂时用 wait-what 重讲。」 |
| **9 部署** | `wizard` + `research` | 账号/密钥/面板；官方价格/备案 | 部署向导 + 证据 | 「用 wizard 生成部署向导；用 research 查官方部署文档。」 |
| **10 复盘** | `retro` + `teach` + `writing-fragments/beats/shape` | 复盘环境；学习记录；写洞见/文章 | 改进项 + learning record + 文章 | 「用 retro 复盘这次会话的环境；用 teach 记 learning record；用 writing-* 写洞见。」 |

## 每把枪一句话

| 工具 | 一句话 | 触发 |
|---|---|---|
| `ask-matt` | 路由：不知道用哪个 skill 时问它 | 模型/用户 |
| `grilling` |  relentless 访谈；事实 AI 查、决策人拍 | 模型 |
| `grill-with-docs` | grilling + 术语表 + ADR，留下纸面 | 用户 |
| `to-spec` | 把对话综合成 spec，发到 issue tracker | 用户 |
| `to-tickets` | 拆成 tracer-bullet tickets + blocking edges | 用户 |
| `implement` | 按 ticket 实现：tdd → code-review → commit | 用户 |
| `implement-spec` | 整 spec 用 implementer subagents 并行实现 | 用户 |
| `tdd` | 红→绿→重构的参考：seam、好测试、反模式 | 模型 |
| `code-review` | 双轴（Standards + Spec）并行审查 | 模型 |
| `retro` | 复盘会话，改环境不改代码 | 用户 |
| `diagnosing-bugs` | 先建紧反馈回路，再修 bug + 变异证明 | 模型 |
| `codebase-design` | 深模块词汇：module/interface/depth/seam/adapter | 模型 |
| `domain-modeling` | 术语表 + ADR，只在值得时写 | 模型 |
| `prototype` | 一次性代码回答一个设计问题 | 模型 |
| `research` | 后台 agent 查一手来源，写引用文件 | 模型 |
| `wizard` | 生成 bash 向导，带人做只有人能做的事 | 模型 |
| `handoff` | 把上下文压成交接文件 | 用户 |
| `wait-what` | 听不懂时让它用大白话重讲 | 用户 |
| `teach` | 有状态的教学 workspace | 用户 |
| `writing-fragments` | 攒碎片、找 leading word | 用户 |
| `writing-beats` | 排节拍，每个概念先落地 | 用户 |
| `writing-shape` | 从开头一段段长成文章 | 用户 |

## 没有安装这些 skill 怎么办

工具是加速器，不是前提。没装时，按本 skill 每个 Phase 的动作/闸门手工做；装了再把对应工具接进来。

## 安装（给 AI 看）

```bash
# 任选一个宿主
npx skills@latest add mattpocock/skills -a <agent>   # cursor / codex / claude-code / ...
# 或在 Claude Code 里
claude plugin install mattpocock-skills@claude-plugins-official
```

或者直接打开 https://github.com/mattpocock/skills 看 README。

