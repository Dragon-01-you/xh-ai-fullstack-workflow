# AGENTS.md · 项目规则书（给所有 AI 的启动文件）

> 这是规则，不是知识。任何 AI 开工前先读它；超过 100 行就删减。

## 项目一句话
<帮谁、解决什么、这一版做到什么算成功>

## 当前阶段
看 `state.json`；只读 `current_phase` 对应的 `phases/phase-N.md`。

## 项目地图
- `<入口文件>`：HTTP/页面入口
- `<src/>`：业务模块
- `<test/>`：测试
- `phases/`、`gates/`、`templates/`：流程与证据
- `SPEC.md`、`SLICES.md`、`EVIDENCE.md`、`RUNBOOK.md`

## 命令（先跑这一条）
- `npm run check`：语法 + 全部测试（提交前必须绿）
- `npm test`：只跑测试
- `npm start`：本地起服务
- `node gates/state.mjs show`：我在哪一阶段

## 红线（物理拦截在 .githooks/pre-commit）
1. 不读 `.env`、私钥、密钥。
2. 不上传用户源码/隐私。
3. 禁止无头浏览器；只用用户已登录的真实浏览器。
4. 不做支付、不代付、不保存支付信息。
5. 不许改测试来让测试变绿；不许删别人的测试。
6. 不许无确认执行破坏性命令（reset --hard、删除、强推）。
7. 不提交 `node_modules/`、`data/`、`.env`、数据库文件。

## 协作铁律
1. **决策不外包**：架构/数据/接口/错误策略给 2–3 个选项 + 代价，人拍板。
2. **预测先行**：动手前先问“你的预测是什么”。
3. **行为验收**：人亲手跑验收。
4. **证据优先**：只看 `.gates/*.json` 的 exit code，不信“我测过了”。

## 声明式执行
改文件前先在 RUNLOG 写 BEFORE（意图/改哪层/对应验收/预期），人确认后执行；执行后写 AFTER。

## 分型
每个切片先标 `deterministic` 或 `exploratory`；exploratory 只做 90 分钟 spike，代码必须删。
