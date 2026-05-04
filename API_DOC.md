# CFIP API 接口文档

本文档面向自动化脚本和 AI 读取，描述 CFIP（优选 IP/域名）的管理、同步黑名单和 CF 同步读取接口。

## 通用约定

- 管理接口前缀：`/api`
- 管理接口鉴权：请求头 `X-API-Key: <登录后返回的会话 apiKey>`
- 内部同步接口鉴权：请求头 `X-Internal-Key: <环境变量 API_KEY>`，也支持查询参数 `?key=<API_KEY>`
- 响应格式：管理接口默认返回 JSON，公开订阅接口返回 Base64 文本
- 布尔字段：接口接受 `true`/`false`、`1`/`0`，字符串 `true` 大小写不敏感，数据库中保存为 `1` 或 `0`
- 更新响应中的 `changes` 表示实际更新行数；`changes = 0` 表示请求成功但没有匹配到需要更新的记录。

## CFIP 对象字段

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | number | CFIP ID |
| `address` | string | IP 地址或域名 |
| `port` | number | 端口，默认 `443` |
| `remark` | string | 备注 |
| `name` | string | 订阅节点显示名，优先级高于 `remark` |
| `sort_order` | number | 排序值，默认 `0` |
| `latency` | number | 延迟，建议单位 ms |
| `speed` | number | 速度，建议单位 kB/s |
| `country` | string | 国家/地区代码 |
| `isp` | string | 运营商 |
| `fail_count` | number | 失败次数 |
| `status` | string | `enabled`、`disabled`、`invalid` |
| `sync_blacklisted` | number | CF 同步黑名单，`1` 表示已拉黑，`0` 表示允许同步 |

## 黑名单规则

- `sync_blacklisted = 1` 的 CFIP 会保留在管理接口 `/api/cfip` 中。
- `sync_blacklisted = 1` 的 CFIP 不会从 `/api/internal/cfip` 返回。
- 公开订阅和订阅生成接口默认排除 `sync_blacklisted = 1` 的 CFIP。
- 如果对应订阅配置开启 `include_blacklisted_cfip = 1`，被拉黑的 CFIP 可以参与订阅生成。
- `status` 和 `sync_blacklisted` 是独立字段：禁用/失效控制状态筛选，黑名单始终控制 CF 同步；订阅是否包含黑名单由订阅配置控制。

## 订阅配置黑名单字段

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `include_blacklisted_cfip` | number | `1` 表示该订阅生成时包含已拉黑 CFIP，`0` 表示排除，默认 `0` |

该字段适用于：

- `/api/subscribe/config`
- `/api/argo`
- `/api/subscribe/vless/generate`
- `/api/subscribe/ss/generate`

请求体兼容驼峰别名 `includeBlacklistedCfip`。

`/api/subscribe/vless/generate` 和 `/api/subscribe/ss/generate` 未传该字段时保留已有订阅配置值；没有已有配置时按默认 `0` 处理。

## 获取管理列表

- **URL**: `/api/cfip`
- **Method**: `GET`
- **Headers**: `X-API-Key`
- **返回**: 全部 CFIP，包括已拉黑项

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "address": "104.16.123.123",
      "port": 443,
      "remark": "美国优选",
      "name": "US-1",
      "status": "enabled",
      "sync_blacklisted": 0
    }
  ]
}
```

## 新增 CFIP

- **URL**: `/api/cfip`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`, `X-API-Key`

```json
{
  "address": "104.16.123.123",
  "port": 443,
  "remark": "美国优选",
  "name": "US-1",
  "status": "enabled",
  "sync_blacklisted": 0,
  "sort_order": 1,
  "latency": 150,
  "speed": 5000,
  "country": "US",
  "isp": "Cloudflare"
}
```

## 修改 CFIP

- **URL**: `/api/cfip/{id}`
- **Method**: `PUT`
- **Headers**: `Content-Type: application/json`, `X-API-Key`
- **说明**: 只传需要修改的字段

```json
{
  "latency": 145,
  "speed": 6000,
  "sync_blacklisted": 1
}
```

兼容别名：`blacklisted` 等价于 `sync_blacklisted`。

## 单条拉黑/解黑

- **URL**: `/api/cfip/{id}/blacklist`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`, `X-API-Key`
- **ID 要求**: `{id}` 必须是正整数

拉黑：

```json
{ "sync_blacklisted": 1 }
```

解黑：

```json
{ "sync_blacklisted": 0 }
```

响应：

```json
{
  "success": true,
  "data": {
    "id": 12,
    "sync_blacklisted": 1,
    "changes": 1
  }
}
```

如果 `{id}` 不存在，接口仍返回 `success: true`，但 `data.changes` 为 `0`。

## 批量拉黑/解黑

- **URL**: `/api/cfip/batch/blacklist`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`, `X-API-Key`
- **ID 要求**: `ids` 必须是非空、非重复的正整数数组

```json
{
  "ids": [1, 2, 3],
  "sync_blacklisted": 1
}
```

响应：

```json
{
  "success": true,
  "data": {
    "requested": 3,
    "changes": 3,
    "sync_blacklisted": 1
  }
}
```

`requested` 表示请求中的有效 ID 数量，`changes` 表示实际更新行数。部分 ID 不存在时，`changes` 可能小于 `requested`。

## 批量状态更新

- **URL**: `/api/cfip/batch/status`
- **Method**: `POST`

```json
{
  "ids": [1, 2, 3],
  "status": "disabled"
}
```

`status` 可选值：`enabled`、`disabled`、`invalid`。

## 批量新增

- **URL**: `/api/cfip/batch`
- **Method**: `POST`
- **Body**: CFIP 对象数组

```json
[
  {
    "address": "104.16.123.123",
    "port": 443,
    "remark": "美国优选",
    "name": "US-1",
    "status": "enabled",
    "sync_blacklisted": 0
  }
]
```

## 批量修改

- **URL**: `/api/cfip/batch/update`
- **Method**: `POST`

```json
{
  "items": [
    {
      "id": 1,
      "latency": 120,
      "speed": 7000,
      "sync_blacklisted": 0
    }
  ]
}
```

## 内部 CF 同步读取

- **URL**: `/api/internal/cfip`
- **Method**: `GET`
- **Headers**: `X-Internal-Key: <环境变量 API_KEY>`
- **替代鉴权**: `/api/internal/cfip?key=<环境变量 API_KEY>`
- **返回**: 未拉黑的 CFIP 列表

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "address": "104.16.123.123",
      "port": 443,
      "status": "enabled",
      "sync_blacklisted": 0
    }
  ]
}
```

## 订阅相关黑名单行为

以下入口默认排除 `sync_blacklisted = 1` 的 CFIP；如果对应订阅配置开启 `include_blacklisted_cfip = 1`，则订阅生成会包含已拉黑 CFIP：

- `/sub/token/{token}`
- `/sub/{uuid}`
- `/sub/ss/{password}`
- `/sub/argo/{token}`
- `/api/subscribe/vless/generate`
- `/api/subscribe/ss/generate`

`/api/internal/cfip` 不受该设置影响，始终排除已拉黑 CFIP。

`cfipStatus` 仍用于状态筛选：

```text
/sub/{uuid}?cfipStatus=enabled,invalid
```

显式指定 CFIP ID 时，状态不强制检查；黑名单是否生效由订阅配置的 `include_blacklisted_cfip` 决定：

```text
/sub/{uuid}?cfip=1,2,3
```
