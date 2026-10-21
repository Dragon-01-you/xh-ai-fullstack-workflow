# CHANGELOG

## v2.3.0（2026-10-21）· --rerun + gate-risk

- **`--rerun`**：`verify-evidence --phase N --rerun` 先按阶段重跑关键 gate，再验证。
  - Phase 5 重跑 `gate-tdd` / `gate-mutation` / `gate-risk`；Phase 6 会先重跑 Phase 5，再跑解释关。
  - Phase 7/8 用旧 `.gates/http.json` 里的 URL 重跑；Phase 4 重跑 slices + risk。
- **`gate-risk`**：`SLICES.md` 标“高/high”的切片，必须在 `RISK.md` 有回滚预案 + 人工确认；Phase 4/5 都要求。
- 审计：`node audit/run-audit.mjs` → **44/44 PASS**。
- 模板指纹更新为 `<!-- TEMPLATE v2.3.0 -->`；新增 `templates/RISK.md`。

## v2.2.1（2026-10-21）· 审计 2 修复

### P0
- **命令锁定**：`gate-check` / `gate-tdd` 默认只用 `package.json` 的 `scripts.check` / `scripts.test`（或标准兜底）。
  - 自定义命令必须显式 `--allow-arbitrary-command`，写入 `trusted:false`；`verify-evidence` 拒绝。
  - `gate-mutation` 的测试命令必须与 `gate-tdd` 完全相同，否则拒绝。
- **mutation 防绕过**：变异后先 `node --check`；语法坏不算 `caught`；禁止变异 `test/tests/__tests__/fixtures` 或 `*.test.js`。
- **provenance 校验**：新增 `version`、`trusted`、`command_source`；`verify-evidence` 检查 `trusted:true` 与 tdd/mutation 命令一致。

### P1
- **占位符误报修复**：去掉 `示例`、`项目名`、`xxx` 等通用词；`<...>` 只匹配标识符风格，排除 `<200>`。
- **模板指纹**：模板顶部加 `<!-- TEMPLATE v2.2.1 -->`；原样复制模板会红，而不是靠猜词。
- **新鲜度放宽**：24h → 7 天；`--max-age-days` / `--allow-stale` 可调。
- **hint 字段**：内容闸门红时给出“检测到模板占位符 / TEMPLATE 标记”的提示。
- **Phase 8**：外网验收也要求 `--expect-text`，防白屏 200。
- **CI**：`templates/ci-check.yml` 默认跑 mutation（参数需替换）。
- **审计**：`node audit/run-audit.mjs` → **41/41 PASS**（新增命令锁定 / mutation 绕过 / 误报用例）。

### Docs
- 新增 `gates/THREAT-MODEL.md`：记录各类绕过与拦截边界。
- 新增 `CHANGELOG.md`；SKILL/README/AUDIT 统一版本号。
- `BACKLOG.md` 更新：`--rerun`、`gate-risk` 留到 v2.3。

## v2.2（2026-10-21）
- P0：verify-evidence spike bug、scripts 恢复、内容闸门、provenance。
- 新增 `audit/run-audit.mjs` 可复现审计（34/34）。

## v2.1（2026-10-21）
- 重排阶段：需求 → 选型 → 环境 → 规格 → 切片 → TDD/Spike → 证据 → 验收 → 部署 → 交接 → 复盘。
- walking skeleton 放进 Phase 5，不再是独立阶段。

## v2.0（2026-10-21）
- 机器闸门 + 人的闸门 + 状态机 + 分型 + 平台知识外置。
