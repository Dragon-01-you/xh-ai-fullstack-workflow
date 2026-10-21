# 平台：腾讯云 CloudBase（静态托管）

last_verified: 2026-10-20
source: https://console.cloud.tencent.com/tcb
recheck: `tcb env list` + `tcb hosting detail -e <envId>`

## 适合
纯前端/展示页（HTML/CSS/JS）；不适合需要 Node 常驻 + SQLite 的后端。

## 前置条件
- 账号：腾讯云账号（微信登录）
- 支付：按量/体验版（价格以控制台为准，未核实）
- 实名：需要（国内云资源）
- 域名/备案：测试域名可直接用；正式域名需 ICP
- 运行时：静态托管，无 Node

## 部署命令
```bash
tcb login
tcb env list
tcb hosting deploy ./dist -e <envId> --verify
tcb hosting detail -e <envId>
```

## 容易卡住的点
- 测试域名会弹“风险提醒”，访客要点“确定访问”。
- 静态托管只放前端；后端要换云托管/轻量服务器。
- CDN 缓存通常几分钟刷新。

## 过期提醒
超过 90 天未复核：先跑 `tcb env list` 和 `tcb hosting detail`，再使用本文件。
