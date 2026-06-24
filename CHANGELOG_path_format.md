# VLESS 订阅路径格式功能更新

## 更新内容

为 VLESS 订阅配置添加了新的路径格式选项，支持简洁格式的代理参数传递。

## 功能说明

### 1. 新增路径格式选择

在创建或编辑 VLESS 订阅配置时，可以选择两种路径格式：

#### 默认格式（default）
传统的 URL 查询参数格式：
```
/?ed=2560&proxyip=example.com
```

#### 简洁格式（compact）
更简洁的路径参数格式：

- **仅 SOCKS5**: `/s=user:pass@host:port?ed=2560`
- **全局 SOCKS5**: `/g=user:pass@host:port?ed=2560`
- **仅 ProxyIP**: `/p=ProxyIP.domain.com?ed=2560`
- **回退 HTTP**: `/h=host:port?ed=2560`
- **全局 HTTP**: `/gh=host:port?ed=2560`

### 2. 格式转换逻辑

后端根据代理类型自动转换：

- **SOCKS5 代理** (`socks5://user:pass@host:port`):
  - 生成格式: `/s=user:pass@host:port?ed=2560`
  
- **HTTP/HTTPS 代理** (`http://user:pass@host:port`):
  - 生成格式: `/h=user:pass@host:port?ed=2560`
  
- **普通 ProxyIP** (域名或 IP):
  - 生成格式: `/p=domain.com?ed=2560`

## 数据库变更

添加了 `path_format` 字段到 `subscribe_config` 表：
- 字段类型: TEXT
- 默认值: 'default'
- 可选值: 'default', 'compact'

## 代码变更

### 后端 (_worker.js)

1. **数据库迁移** (第 78 行)
   - 添加 `path_format` 字段

2. **订阅配置新增** (handleAddSubscribeConfig)
   - 接收 `pathFormat` 参数
   - 保存到数据库

3. **订阅配置更新** (handleUpdateSubscribeConfig)
   - 支持更新 `pathFormat` 字段

4. **订阅生成** (handleSubscribe)
   - 新增 `generatePath()` 辅助函数
   - 根据 `path_format` 配置生成相应格式的路径
   - 支持普通节点和智能节点

### 前端 (index.html)

1. **订阅配置列表显示**
   - 显示当前使用的路径格式

2. **添加订阅配置表单**
   - 新增路径格式下拉选择框（仅 VLESS）
   - 显示格式说明

3. **编辑订阅配置表单**
   - 支持修改路径格式
   - 保留原有格式选择

4. **提交处理**
   - 读取并提交 `pathFormat` 参数

## 使用示例

### 创建使用简洁格式的订阅

1. 进入"订阅生成 VLESS"页签
2. 点击"➕ 添加配置"
3. 填写必填信息（UUID、域名等）
4. 在"路径格式"下拉框中选择"简洁格式"
5. 保存配置

### 生成的节点示例

假设：
- CFIP: `cf.domain.com:443`
- 全局出站 SOCKS5: `socks5://user:pass@proxy.com:1080`
- 基础路径: `/?ed=2560`

**默认格式生成**:
```
vless://uuid@cf.domain.com:443?...&path=%2F%3Fed%3D2560%26proxyip%3Dsocks5%3A%2F%2Fuser%3Apass%40proxy.com%3A1080
```

**简洁格式生成**:
```
vless://uuid@cf.domain.com:443?...&path=%2Fs%3Duser%3Apass%40proxy.com%3A1080%3Fed%3D2560
```

## 兼容性

- 现有订阅配置自动使用默认格式（`default`）
- 不影响已有订阅的正常使用
- 新旧格式可以共存

## 注意事项

1. 路径格式选项仅适用于 VLESS 订阅，SS 订阅不受影响
2. 简洁格式需要后端 Worker 支持相应的路径解析逻辑
3. 修改路径格式后，订阅链接保持不变，但生成的节点路径会变化
