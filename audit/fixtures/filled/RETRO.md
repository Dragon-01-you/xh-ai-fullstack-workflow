# RETRO · 2026-10-21
## 哪不好
Phase 5 的破坏实验之前只看 AI 报告，没有 JSON 证据。
## 为什么
以为脚本输出就是证据，没检查 provenance。
## 流程改动
```diff
- Phase 5 闸门：AI 报告“破坏实验通过”
+ Phase 5 闸门：gates/gate-mutation.mjs 的 caught=true
```
## 下次只改一个点
先跑 gate-mutation，再 advance。
