# Phase 2 · 走通一条线（walking skeleton）

> 目标：先跑通一条**最薄的竖切**：页面 → 接口 → 数据 → 返回。不追求功能完整，只证明链路通。

## 做什么

1. 一个页面（能打开、能点一下）。
2. 一个接口（返回固定 JSON 也行）。
3. 一次数据读写（SQLite/内存/文件都行，先证明能存能取）。
4. 一个 `/health` 返回 `{ ok: true }`。
5. 本地跑起来：`npm start`，浏览器/curl 能访问。

## 不要做

- 不要做完整功能、不要做漂亮 UI、不要接真实支付/认证。
- 不要写很多测试；这一阶段只证明“链路通”。

## 机器闸门

```bash
node gates/gate-http.mjs --url http://127.0.0.1:3000/health --expect-status 200
node gates/gate-http.mjs --url http://127.0.0.1:3000/ --expect-status 200
# 产物：.gates/http.json
```

## 人的闸门

- 用手机/另一台设备打开一次（不是 localhost）。
- 截图存 `evidence/skeleton/`。

## 失败分支

- 端口被占 → 换端口，不要杀未知进程。
- 页面 500 → 先看服务端日志，再做下一步。
- 超过 4 小时还跑不通 → 砍到只剩 `/health`，先通再扩。

## 时间盒

2–4 小时。超时就砍范围。

## 手工版

`npm start` + 浏览器打开 + F12 看 Network；curl 访问 `/health`。
