# 芯火 · XH | AI 全栈工作流（Skill 包）

> 芯火（XH）出品。公开版已去除本地路径，可直接安装使用。

> 把「用 AI 从零做一个真实全栈项目」的全过程，固化成一套**可被任何 AI 读取、可重复执行**的 skill。
> 十个阶段：搭环境 → 扫描 → 前置条件 → spec → 架构 → TDD → 实现 → 验收 → 部署 → 复盘。

## 这是什么

不是代码库，是一套**流程说明书 + 模板 + 闸门**。任何能读文件的 AI（Claude Code / Codex / Cursor / DSH / Kimi CLI…）读完 `SKILL.md` 就能按它带你做项目。

核心一句话：

> **先搭环境，再出考卷，再让 AI 答卷。人是出题人/判卷人，AI 是考生/施工队。**

## 目录

```
ai-fullstack-workflow/
├── SKILL.md                          # 入口：十个阶段 + 闸门 + 反模式
├── README.md                         # 本文件
├── references/
│   ├── 01-environment.md             # git / check / 拦截 / AGENTS / PROGRESS
│   ├── 02-scan-and-prerequisites.md  # 项目画像 / 六项前置 / 平台选项
│   ├── 03-spec-and-arch.md           # spec 模板 / 验收 / 架构 / ADR
│   ├── 04-tdd.md                     # 测试示例 / 对的红 / 假测试 / 破坏实验
│   ├── 05-deploy-and-retro.md        # CloudBase / Render / 验收 / 复盘 / 洞见卡
│   └── 06-tool-map.md                # 阶段 → 工具 → 调用话术（Matt skills）
└── scripts/
    ├── syntax-check.js               # 一键 check 的语法检查
    ├── guard-staged.js               # 提交拦截（.env/密钥/数据/依赖）
    └── pre-commit                    # 复制到 .githooks/pre-commit
```

## 怎么安装

**方式 A（推荐）**：把整个 `ai-fullstack-workflow/` 复制到你的 AI 工具 skills 目录：

- Claude Code / DSH：`C:\Users\<你>\.agents\skills\ai-fullstack-workflow\`
- Claude Code 专用：`C:\Users\<你>\.claude\skills\ai-fullstack-workflow\`
- Kimi CLI：`C:\Users\<你>\.kimi-code\skills\ai-fullstack-workflow\`

**方式 B（不安装）**：直接对 AI 说：  
> 「读 `xh-ai-fullstack-workflow/SKILL.md`，按它的十个阶段带我做一个全栈项目。」

## 怎么用（三种典型场景）

### 1. 从零做一个项目

> 「读这个 skill。从 Phase 0 开始，每个阶段结束让我确认再继续。先把 Phase 1 的环境搭好，再写第一行业务代码。」

### 2. 已经卡住了（部署/前置条件）

> 「读这个 skill 的 Phase 3 和 Phase 9。先扫描我的项目，说明前置条件，再告诉我缺什么、怎么补，不要先推荐平台。」

### 3. 只想学，不想被 AI 代做

> 「读这个 skill。你是考生/施工队，我是出题人/判卷人。每个 Phase 我先写、先拍板，你只挑错和给选项。」

## 这套流程解决什么问题

- AI 一句话生成，你什么都没学到
- AI 做完了，但代码不敢改、不敢上线
- 部署卡在账号/支付/实名/备案
- 修一处崩三处，没有回滚
- 不知道测试该测什么，测试绿了也不放心

## 配套工具（可选的“枪”）

这套流程可以单独跑；装了 Matt Pocock 的 skills 会更快、更稳：

- 需求/术语：`grilling` / `grill-with-docs` / `domain-modeling`
- spec/拆分：`to-spec` / `to-tickets`
- 实现：`tdd` / `implement` / `implement-spec` / `diagnosing-bugs`
- 审查/复盘：`code-review` / `retro`
- 架构：`codebase-design` / `prototype`
- 部署：`wizard` / `research`
- 写作：`writing-fragments` / `writing-beats` / `writing-shape`
- 学习：`teach` / `wait-what` / `handoff`

完整映射（每个阶段用哪把、怎么调用）见 [`references/06-tool-map.md`](references/06-tool-map.md)。  
上游：https://github.com/mattpocock/skills

## 它的来源

- 流程骨架参考 Matt Pocock 的 skills 结构（SKILL.md + references + 闸门 + 反模式）
- “出题人/考生”的写作洞见来自姜胡说的影响力写作框架
- 所有阶段来自一次真实实践：搭环境、TDD 红绿、破坏实验、扫描器、CloudBase 部署、Render 前置条件翻车

## 边界

- 它不替你写代码，只规定“怎么做、何时停、怎么验收”
- 平台价格/政策会变，部署前以官网当日为准
- 国内正式域名要备案；测试域名只能验证


