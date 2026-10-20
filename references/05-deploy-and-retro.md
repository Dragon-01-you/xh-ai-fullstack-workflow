# 05 · 部署与复盘（Phase 9–10）

## 一、部署前：前置条件必须已满足

回到 Phase 3 的六项：浏览器/登录、账号、支付、实名、域名/备案、运行时。
缺一项，先补；不要边部署边发现“没有外币卡”。

## 二、CloudBase 静态托管（本项目实测路径）

```bash
# 1. 登录（CLI 会开浏览器；账号要实名）
tcb login

# 2. 看环境
tcb env list

# 3. 部署静态目录
tcb hosting deploy ./showcase -e <envId> --verify

# 4. 查看域名/状态
tcb hosting detail -e <envId>
```

- 测试域名会弹“风险提醒”，访客点“确定访问”；
- 正式对外要自定义域名 + ICP 备案；
- 静态托管只放前端；带后端要换云托管/轻量服务器。

## 三、Render（国外，需要外币卡）

根目录 `render.yaml`：

```yaml
services:
  - type: web
    name: deploy-helper
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_VERSION
        value: "24"
      - key: DB_PATH
        value: data/app.db
```

- 注册：https://dashboard.render.com/register
- 私有仓库要授权 GitHub App；可能触发 sudo 验证码；
- 免费层无持久盘，SQLite 会丢数据；长期用要换 Postgres。

## 四、部署后验收

```bash
curl -sS https://<your-url>/health      # 期望 {"ok":true}
curl -sS https://<your-url>/ | head -5  # 看标题/HTML
```

- 必须是**外网**访问，不是 localhost；
- 手机再打开一次；
- 记进 TRACE：线上行为 + 证据 + 时间。

## 五、复盘三问

1. 哪是狗屎？（哪一步最烂/没跑通）
2. 为什么？（概念没懂、不会查、任务切太大？）
3. 我得到什么？（下次怎么改）

**只留一个明天要修的点**，不要列十个。

## 六、洞见卡（四要素）

```markdown
## 一句话要点
## 背后的机理
## 可执行的方法（1/2/3）
## 边界条件（什么时候不能用）
```

三铁律：不粘贴原文；用自己的话；写清“我要怎么用它”。

## 七、每日输出

写到 `output\YYYY-MM-DD.md`：

1. 今天做了什么（3 行）
2. 小白版：今天懂了什么
3. 专业版：机制/术语/边界
4. 今天踩的一个坑（现象/原因/修法）
5. 一句可迁移的结论
6. 明天验证什么（1 条）

## Phase 9–10 完成清单

- [ ] 六项前置已满足
- [ ] 外网 `/health` 200 + 页面标题正确
- [ ] TRACE 有线上证据
- [ ] 三问复盘 + 一个修点
- [ ] 洞见卡 + 当日输出

