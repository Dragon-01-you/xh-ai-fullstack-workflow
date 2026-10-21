# EVIDENCE · 展示页
| 需求 | 测试 | 代码路径 | 手工证据 | 线上行为 | 状态 |
|---|---|---|---|---|---|
| S1 | 无自动化 | public/index.html | evidence/acceptance/s1.png | GET / 200 | 通过 |
| S2 | test/api.test.js | server.js | evidence/acceptance/s2.txt | POST 200 | 通过 |
## 数据流（解释关，不看代码写）
浏览器打开首页并提交表单，请求进入 server.js，经过 validate 校验和 plans 规则，写入 SQLite，再返回 JSON 给页面渲染结果。
## 最容易坏的一个点
SQLite 文件路径在部署环境里不存在，导致提交 500。
## 怎么发现它坏了
/health 仍然 200，但提交返回 500，日志里出现 SQLITE_CANTOPEN。
