# Argo VLESS 订阅生成器

这个 Worker 从 CF Snippets Extend 获取启用的 CFIP 信息，自动生成 VLESS 订阅链接。

## 目录

- [功能特点](#功能特点)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [部署指南](#部署指南)
- [使用方法](#使用方法)
- [VLESS 链接格式](#vless-链接格式)
- [故障排查](#故障排查)
- [安全建议](#安全建议)

---

## 功能特点

- ✅ 自动从 CF Snippets Extend 获取启用状态的 CFIP
- ✅ 生成标准的 VLESS 订阅链接（Base64 编码）
- ✅ 支持 IPv4 和 IPv6 地址
- ✅ 通过环境变量配置，安全便捷
- 🔐 **登录权限控制**：使用 SNIPPETS_API_KEY 进行身份验证
- 🔑 **多种认证方式**：支持 Cookie、URL Token、Header 三种认证方式
- 🎨 **友好的 Web 界面**：提供登录页面和管理界面
- 🛡️ **安全的 Cookie 设置**：HttpOnly、Secure、SameSite 保护

---

## 快速开始

### 前置要求

- 已部署 CF Snippets Extend Worker
- 已获取 CF Snippets Extend 的 API Key
- 已准备好 UUID 和 Argo Tunnel 域名

### 快速部署

```bash
# 1. 进入目录
cd argo

# 2. 复制配置文件
cp wrangler.json.example wrangler.json

# 3. 编辑配置（填入你的实际配置）
nano wrangler.json

# 4. 部署
npx wrangler deploy
```

部署成功后，访问你的 Worker 域名即可使用。

---

## 配置说明

### wrangler.json 配置文件

这是 Cloudflare Workers 的配置文件，用于定义 Worker 的名称、入口文件和环境变量。

#### 配置示例

```json
{
  "name": "argo-vless-sub",
  "main": "worker.js",
  "compatibility_date": "2024-01-01",
  "vars": {
    "UUID": "f8e7d6c5-b4a3-9281-7065-fedcba098765",
    "ARGO_DOMAIN": "my-argo-tunnel-xyz789.trycloudflare.com",
    "SNIPPETS_API_URL": "https://snippets-api.example.workers.dev",
    "SNIPPETS_API_KEY": "example_api_key_AbCdEfGh123456789"
  }
}
```

### 配置项详解

#### 1. name（Worker 名称）

```json
"name": "argo-vless-sub"
```

- **说明**：Worker 的名称，会成为默认域名的一部分
- **格式**：小写字母、数字、连字符（-）
- **示例**：
  - `argo-vless-sub` → `argo-vless-sub.你的账号.workers.dev`
  - `my-subscription` → `my-subscription.你的账号.workers.dev`
- **建议**：使用有意义且不易猜测的名称

#### 2. UUID（用户 ID）

```json
"UUID": "f8e7d6c5-b4a3-9281-7065-fedcba098765"
```

- **说明**：VLESS 协议使用的用户 ID
- **格式**：标准 UUID（8-4-4-4-12 格式）

**如何生成 UUID**：

```bash
# Linux/macOS
uuidgen

# Python
python3 -c "import uuid; print(uuid.uuid4())"

# Node.js
node -e "console.log(require('crypto').randomUUID())"
```

**在线生成**：
- https://www.uuidgenerator.net/
- https://www.uuid.online/

**安全建议**：
- 使用随机生成的 UUID
- 不要使用简单或有规律的 UUID
- 定期更换 UUID

#### 3. ARGO_DOMAIN（Argo 域名）

```json
"ARGO_DOMAIN": "my-argo-tunnel-xyz789.trycloudflare.com"
```

- **说明**：Argo Tunnel 的域名
- **格式**：完整的域名（不含 `https://`）

**如何获取 Argo Tunnel 域名**：

**方式 1：使用 cloudflared 临时隧道**
```bash
cloudflared tunnel --url http://localhost:8080
```
输出示例：
```
Your quick Tunnel has been created! Visit it at:
https://my-tunnel-abc123.trycloudflare.com
```
使用 `my-tunnel-abc123.trycloudflare.com`

**方式 2：使用命名隧道**
```bash
cloudflared tunnel create my-tunnel
cloudflared tunnel route dns my-tunnel tunnel.example.com
```
使用 `tunnel.example.com`

**方式 3：使用自定义域名**
- 在 Cloudflare Dashboard 中配置
- 使用你自己的域名，如 `vless.example.com`

**注意事项**：
- ❌ 不要包含 `https://` 或 `http://`
- ❌ 不要包含路径（如 `/path`）
- ✅ 确保域名可以正常访问

#### 4. SNIPPETS_API_URL（API 地址）

```json
"SNIPPETS_API_URL": "https://snippets-api.example.workers.dev"
```

- **说明**：CF Snippets Extend Worker 的完整 URL
- **格式**：完整的 HTTPS URL（不要带尾部斜杠）
- **来源**：你部署的 CF Snippets Extend Worker 的域名

**如何获取**：
1. 部署 CF Snippets Extend Worker 后，在 Dashboard 中查看
2. 默认格式：`https://worker名称.你的账号.workers.dev`
3. 如果绑定了自定义域名，使用自定义域名

**注意事项**：
- ✅ 必须使用 HTTPS
- ❌ 不要在末尾添加斜杠 `/`
- ✅ 确保 Worker 正常运行且可访问

#### 5. SNIPPETS_API_KEY（API 密钥）

```json
"SNIPPETS_API_KEY": "example_api_key_AbCdEfGh123456789"
```

- **说明**：CF Snippets Extend 的 API 密钥，用于身份验证
- **格式**：任意字符串（建议使用强随机字符串）
- **来源**：在部署 CF Snippets Extend 时设置的 API Key

**如何生成强密钥**：

```bash
# 使用 openssl（推荐）
openssl rand -base64 32

# 使用 Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**安全建议**：
- 使用至少 20 个字符的随机字符串
- 包含大小写字母、数字
- 不要使用简单密码（如 `123456`、`password`）
- 不要与其他服务共用密钥
- 定期更换密钥
- 不要将密钥提交到公共仓库

### 配置示例

#### 示例 1：使用临时 Argo Tunnel

```json
{
  "name": "my-vless-sub",
  "main": "worker.js",
  "compatibility_date": "2024-01-01",
  "vars": {
    "UUID": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "ARGO_DOMAIN": "quick-tunnel-abc123.trycloudflare.com",
    "SNIPPETS_API_URL": "https://cf-snippets.myaccount.workers.dev",
    "SNIPPETS_API_KEY": "8f7e6d5c4b3a2918273645aAbBcCdDeEfF"
  }
}
```

#### 示例 2：使用自定义域名

```json
{
  "name": "vless-subscription",
  "main": "worker.js",
  "compatibility_date": "2024-01-01",
  "vars": {
    "UUID": "12345678-90ab-cdef-1234-567890abcdef",
    "ARGO_DOMAIN": "tunnel.example.com",
    "SNIPPETS_API_URL": "https://api.example.com",
    "SNIPPETS_API_KEY": "your_secure_api_key_here_123456789"
  }
}
```

### 常见配置错误

#### ❌ 错误 1：UUID 格式不正确

```json
"UUID": "12345678"  // 错误
```

✅ 正确：
```json
"UUID": "12345678-90ab-cdef-1234-567890abcdef"
```

#### ❌ 错误 2：域名包含协议

```json
"ARGO_DOMAIN": "https://tunnel.example.com"  // 错误
```

✅ 正确：
```json
"ARGO_DOMAIN": "tunnel.example.com"
```

#### ❌ 错误 3：API URL 包含尾部斜杠

```json
"SNIPPETS_API_URL": "https://api.example.com/"  // 错误
```

✅ 正确：
```json
"SNIPPETS_API_URL": "https://api.example.com"
```

#### ❌ 错误 4：API Key 太简单

```json
"SNIPPETS_API_KEY": "123456"  // 错误
```

✅ 正确：
```json
"SNIPPETS_API_KEY": "example_key_8f7e6d5c4b3a2918273645"
```

---

## 部署指南

### 方式 1：命令行部署（推荐）

#### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

#### 3. 配置环境变量

```bash
cd argo
cp wrangler.json.example wrangler.json
nano wrangler.json  # 或使用其他编辑器
```

#### 4. 部署

```bash
npx wrangler deploy
```

部署成功后，会显示你的 Worker 域名。

### 方式 2：Dashboard 手动部署

#### 1. 创建 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create Application**
4. 选择 **Create Worker**
5. 输入名称：`argo-vless-sub`
6. 点击 **Deploy**

#### 2. 上传代码

1. 在 Worker 详情页，点击 **Quick Edit**
2. 删除默认代码
3. 复制 `worker.js` 的全部内容
4. 粘贴到编辑器中
5. 点击 **Save and Deploy**

#### 3. 配置环境变量

1. 在 Worker 详情页，点击 **Settings**
2. 选择 **Variables**
3. 在 **Environment Variables** 部分，点击 **Add variable**
4. 添加以下变量：
   - `UUID`: 你的 UUID
   - `ARGO_DOMAIN`: 你的 Argo 域名
   - `SNIPPETS_API_URL`: CF Snippets Extend 的 URL
   - `SNIPPETS_API_KEY`: API 密钥
5. 点击 **Save and Deploy**

### 验证部署

#### 1. 健康检查

```bash
curl https://你的worker域名.workers.dev/health
```

应该返回：
```json
{"status":"ok"}
```

#### 2. 测试登录

访问 Worker 域名，输入 API Key，应该能成功登录。

#### 3. 测试订阅

登录后点击"测试订阅"按钮，或使用命令行：

```bash
curl -H "X-API-Key: 你的API密钥" https://你的worker域名.workers.dev/sub
```

应该返回 Base64 编码的订阅内容。

---

## 使用方法

### 访问管理界面

部署成功后，访问你的 Worker 域名：

```
https://你的-worker-域名.workers.dev/
```

首次访问会显示登录页面，输入你在 `wrangler.json` 中配置的 `SNIPPETS_API_KEY` 即可登录。

### 订阅地址

登录后可以看到订阅地址，支持三种使用方式：

#### 方式 1：Cookie 认证（推荐）

```
https://你的-worker-域名.workers.dev/sub
```

- 登录后自动设置 Cookie
- Cookie 有效期 30 天
- 最安全的方式

#### 方式 2：URL Token 认证

```
https://你的-worker-域名.workers.dev/sub?token=你的API_KEY
```

- 无需登录
- 适合不支持 Cookie 的客户端
- 注意不要泄露 Token

#### 方式 3：Header 认证

```bash
curl -H "X-API-Key: 你的API_KEY" https://你的-worker-域名.workers.dev/sub
```

- 适合 API 调用
- 更灵活的认证方式

### 在客户端中使用

1. 登录管理界面，复制订阅地址
2. 在你的 V2Ray/Clash 等客户端中添加订阅
3. 如果客户端不支持 Cookie，使用带 Token 的订阅地址
4. 更新订阅即可获取所有启用的 CFIP 节点

### API 端点

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/` | GET | 管理界面 | 需要 |
| `/login` | POST | 登录接口 | 否 |
| `/logout` | GET | 登出接口 | 否 |
| `/sub` | GET | 获取订阅 | 需要 |
| `/subscribe` | GET | 获取订阅（别名） | 需要 |
| `/health` | GET | 健康检查 | 否 |

---

## VLESS 链接格式

生成的链接格式为：

```
vless://UUID@CFIP地址:CFIP端口?encryption=none&security=tls&sni=ARGO_DOMAIN&fp=firefox&type=ws&host=ARGO_DOMAIN&path=%2Fvless-argo%3Fed%3D2560#NC-US-ARGO-备注
```

### 参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| `encryption` | `none` | 无加密 |
| `security` | `tls` | 使用 TLS |
| `sni` | `ARGO_DOMAIN` | Server Name Indication |
| `fp` | `firefox` | 浏览器指纹 |
| `type` | `ws` | WebSocket 协议 |
| `host` | `ARGO_DOMAIN` | WebSocket Host |
| `path` | `/vless-argo?ed=2560` | WebSocket 路径 |
| `#` | `NC-US-ARGO-{备注}` | 节点备注 |

### 工作原理

1. Worker 接收订阅请求
2. 验证身份（Cookie/Token/Header）
3. 调用 CF Snippets Extend 的 `/api/cfip` 接口
4. 过滤出 `enabled === 1` 的 CFIP 记录
5. 为每个启用的 CFIP 生成 VLESS 链接
6. 将所有链接合并并进行 Base64 编码
7. 返回订阅内容

---

## 故障排查

### 无法登录

**症状**：输入 API Key 后提示登录失败

**解决方案**：
- ✅ 确认输入的 API Key 与 `wrangler.json` 中的 `SNIPPETS_API_KEY` 一致
- ✅ 检查浏览器是否禁用了 Cookie
- ✅ 尝试清除浏览器缓存和 Cookie
- ✅ 使用无痕模式测试

### 订阅为空

**症状**：订阅更新成功但没有节点

**解决方案**：
- ✅ 登录管理界面，点击"测试订阅"查看详细信息
- ✅ 检查 CF Snippets Extend 中是否有启用的 CFIP（`enabled = 1`）
- ✅ 确认 `SNIPPETS_API_URL` 和 `SNIPPETS_API_KEY` 配置正确
- ✅ 查看 Worker 日志确认是否有错误

**查看日志**：
```bash
wrangler tail
```

### 客户端无法更新订阅

**症状**：客户端提示订阅更新失败

**解决方案**：
- ✅ 如果客户端不支持 Cookie，使用带 Token 的订阅地址
- ✅ 确认订阅地址格式正确
- ✅ 检查网络连接是否正常
- ✅ 尝试在浏览器中直接访问订阅地址

### 无法获取 CFIP

**症状**：提示无法连接到 CF Snippets Extend

**解决方案**：
- ✅ 确认 CF Snippets Extend Worker 正常运行
- ✅ 检查 `SNIPPETS_API_URL` 是否正确
- ✅ 检查 `SNIPPETS_API_KEY` 是否正确
- ✅ 确认网络连接正常

**测试连接**：
```bash
curl -H "X-API-Key: 你的API密钥" https://你的snippets域名/api/cfip
```

### 节点无法连接

**症状**：订阅成功但节点无法使用

**解决方案**：
- ✅ 确认 Argo Tunnel 正常运行
- ✅ 检查 `ARGO_DOMAIN` 配置是否正确
- ✅ 验证 CFIP 地址和端口是否可用
- ✅ 检查客户端配置是否正确

### 部署失败

**症状**：`wrangler deploy` 失败

**解决方案**：

**错误：Authentication error**
```bash
wrangler login
```

**错误：Invalid configuration**
- 检查 `wrangler.json` 格式是否正确
- 确认所有必需字段都已填写

**错误：Name already taken**
- 修改 `name` 字段为其他名称

### 更新代码

如需更新 Worker 代码：

```bash
# 命令行
npx wrangler deploy

# 或在 Dashboard 中重新上传代码
```

### 查看日志

**命令行方式**：
```bash
wrangler tail
```

**Dashboard 方式**：
1. 进入 Worker 详情页
2. 点击 **Logs**
3. 选择 **Begin log stream**

---

## 安全建议

### 配置文件安全

- ✅ **不要将 `wrangler.json` 提交到公共仓库**（已添加到 .gitignore）
- ✅ **设置文件权限**（Linux/macOS）：
  ```bash
  chmod 600 wrangler.json
  ```
- ✅ **备份配置文件到安全位置**

### 密钥安全

- ✅ **定期更换 API Key**（建议每 3-6 个月）
- ✅ **使用强随机 UUID**（至少 128 位熵）
- ✅ **API Key 至少 20 个字符**
- ✅ **不要在多个服务间共用密钥**

### 传输安全

- ✅ **使用 HTTPS 访问**（Cloudflare Workers 默认支持）
- ✅ **Cookie 已设置为 HttpOnly 和 Secure**，防止 XSS 攻击
- ✅ **Cookie 设置了 SameSite=Strict**，防止 CSRF 攻击

### 使用建议

- ✅ **建议使用 Cookie 认证方式**，最安全
- ⚠️ **如果使用带 Token 的订阅地址，注意不要泄露**
- ⚠️ **不要在公共场合展示订阅地址**
- ✅ **定期检查访问日志**

### 安全检查清单

在部署前，请确认：

- [ ] UUID 是随机生成的
- [ ] ARGO_DOMAIN 格式正确
- [ ] SNIPPETS_API_URL 可以正常访问
- [ ] SNIPPETS_API_KEY 足够复杂（至少 20 个字符）
- [ ] wrangler.json 已添加到 .gitignore
- [ ] 没有将配置文件提交到公共仓库
- [ ] 已备份配置文件到安全位置
- [ ] 已测试所有功能正常工作

---

## 更新和维护

### 更新配置

如果需要更新配置：

1. 编辑 `wrangler.json`
2. 重新部署：
   ```bash
   npx wrangler deploy
   ```

或在 Cloudflare Dashboard 中更新环境变量。

### 更新代码

```bash
# 拉取最新代码
git pull

# 重新部署
cd argo
npx wrangler deploy
```

### 监控和日志

```bash
# 实时查看日志
wrangler tail

# 查看最近的日志
wrangler tail --format pretty
```

---

## 常见问题 FAQ

### Q: 支持哪些客户端？

A: 支持所有兼容 VLESS 协议的客户端，包括：
- V2Ray
- V2RayN
- V2RayNG
- Clash
- Clash for Windows
- Shadowrocket
- Quantumult X

### Q: 订阅多久更新一次？

A: 订阅是实时生成的，每次请求都会从 CF Snippets Extend 获取最新的 CFIP 列表。

### Q: 可以自定义节点备注吗？

A: 可以，在 CF Snippets Extend 中为每个 CFIP 设置备注即可。

### Q: 支持多用户吗？

A: 当前版本使用单一 API Key 认证，所有用户共享相同的订阅。如需多用户支持，可以部署多个 Worker 实例。

### Q: 如何限制访问？

A: 通过 API Key 认证已经提供了基本的访问控制。如需更严格的限制，可以：
- 使用 Cloudflare Access
- 添加 IP 白名单
- 实现更复杂的认证机制

### Q: 性能如何？

A: Cloudflare Workers 提供全球边缘计算，响应速度非常快。订阅生成通常在 100ms 以内完成。

---

## 许可证

MIT License

---

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler 文档](https://developers.cloudflare.com/workers/wrangler/)
- [VLESS 协议说明](https://www.v2fly.org/config/protocols/vless.html)
- [Argo Tunnel 文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**：2024-01-16
