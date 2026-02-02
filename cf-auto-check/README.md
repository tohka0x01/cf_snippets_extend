# CF Auto Check

自动测试 Cloudflare 优选 IP/域名的延迟和速度，并通过 API 更新数据库。

## 功能特性

- ✅ 自动测试 CF IP 延迟和速度
- ✅ 自动测试 Proxy IP 延迟
- ✅ 自动测试 Outbound 延迟
- ✅ 支持并发测试
- ✅ 自动更新数据库
- ✅ Docker 部署支持
- ✅ 日志记录
- ✅ 可配置测试间隔

## 快速开始

### 1. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# API 配置
API_URL=https://your-worker.pages.dev
API_KEY=your-api-key-here

# 测试配置
CHECK_INTERVAL=3600          # 检查间隔（秒）
CONCURRENT_TESTS=5           # 并发测试数量
TIMEOUT=5000                 # 超时时间（毫秒）
TEST_URL=https://www.cloudflare.com/cdn-cgi/trace

# 测试模式: cfip, proxyip, outbound, all
TEST_MODE=cfip

# 功能开关
ENABLE_LATENCY_TEST=true     # 启用延迟测试
ENABLE_SPEED_TEST=true       # 启用速度测试
ENABLE_AUTO_UPDATE=true      # 启用自动更新

# 速度测试配置
SPEED_TEST_SIZE=1048576      # 测试数据大小（字节）
SPEED_TEST_DURATION=10000    # 测试持续时间（毫秒）
```

### 2. Docker 部署（推荐）

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 3. 本地运行

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（自动重启）
npm run dev
```

## 配置说明

### 测试模式

- `cfip`: 只测试 CF IP
- `proxyip`: 只测试 Proxy IP
- `outbound`: 只测试 Outbound
- `all`: 测试所有类型

### 并发控制

`CONCURRENT_TESTS` 控制同时测试的 IP 数量，建议设置为 3-10，避免过高导致网络拥堵。

### 测试间隔

`CHECK_INTERVAL` 控制测试周期（秒），建议设置：
- 频繁测试：300-600（5-10分钟）
- 常规测试：1800-3600（30-60分钟）
- 低频测试：7200-14400（2-4小时）

### 超时设置

`TIMEOUT` 控制单次测试的超时时间（毫秒），建议：
- 国内 IP：3000-5000ms
- 国际 IP：5000-10000ms

## API 接口

本项目调用以下 API 接口：

### CF IP 管理
- `GET /api/cfip` - 获取所有 CF IP
- `PUT /api/cfip/:id` - 更新 CF IP 信息

### Proxy IP 管理
- `GET /api/proxyip` - 获取所有 Proxy IP
- `PUT /api/proxyip/:id` - 更新 Proxy IP 信息

### Outbound 管理
- `GET /api/outbound` - 获取所有 Outbound
- `PUT /api/outbound/:id` - 更新 Outbound 信息

## 日志

日志文件保存在 `logs/` 目录下，按日期分文件：
- 格式：`YYYY-MM-DD.log`
- 包含：时间戳、日志级别、消息内容

## 测试结果

测试完成后会自动更新数据库中的备注信息：
- 格式：`原备注 [延迟ms]`
- 例如：`CFIP-1 [45ms]`

如果测试失败（延迟 < 0），会自动禁用该 IP。

## 故障排查

### 1. 连接 API 失败

检查：
- `API_URL` 是否正确
- `API_KEY` 是否有效
- 网络连接是否正常

### 2. 测试超时

尝试：
- 增加 `TIMEOUT` 值
- 减少 `CONCURRENT_TESTS` 值
- 检查目标 IP 是否可达

### 3. Docker 容器无法启动

检查：
- `.env` 文件是否存在
- 环境变量是否配置正确
- Docker 日志：`docker-compose logs`

## 高级配置

### 自定义测试 URL

修改 `TEST_URL` 为其他 Cloudflare 服务：
```env
TEST_URL=https://1.1.1.1/cdn-cgi/trace
```

### 禁用自动更新

如果只想测试不更新数据库：
```env
ENABLE_AUTO_UPDATE=false
```

### 只测试延迟

如果不需要速度测试：
```env
ENABLE_SPEED_TEST=false
```

## 性能优化

1. **合理设置并发数**：根据网络带宽调整 `CONCURRENT_TESTS`
2. **调整测试间隔**：避免过于频繁的测试
3. **使用 Docker**：容器化部署更稳定
4. **监控日志大小**：定期清理旧日志文件

## 许可证

MIT License
