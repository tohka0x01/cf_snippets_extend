# CFIP API 接口文档

本文档描述了如何通过 API 管理 CFIP（优选 IP/域名），包括新增字段（延迟、速度、国家、运营商）的支持。

## 1. 新增 CFIP

用于添加新的优选 IP 或域名。

- **URL**: `/api/cfip`
- **Method**: `POST`
- **Headers**:
    - `Content-Type`: `application/json`
    - `X-API-Key`: `你的API密钥`

### 请求体 (JSON)

| 字段 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `address` | string | 是 | IP 地址或域名 |
| `port` | number | 否 | 端口，默认 443 |
| `remark` | string | 否 | 备注 |
| `enabled` | boolean | 否 | 是否启用，默认 true |
| `sort_order` | number | 否 | 排序值，默认 0 |
| `latency` | number | 否 | **新增** 延迟 (ms) |
| `speed` | number | 否 | **新增** 速度 (kB/s) |
| `country` | string | 否 | **新增** 国家代码 (如 CN, US) |
| `isp` | string | 否 | **新增** 运营商 (如 CMCC, Google) |

**示例请求:**

```json
{
  "address": "104.16.123.123",
  "port": 443,
  "remark": "美国优选",
  "enabled": true,
  "sort_order": 1,
  "latency": 150,
  "speed": 5000,
  "country": "US",
  "isp": "Cloudflare"
}
```

### 响应 (JSON)

```json
{
  "success": true,
  "data": {
    "id": 12,
    "address": "104.16.123.123",
    "port": 443,
    "remark": "美国优选",
    "latency": 150,
    "speed": 5000,
    "country": "US",
    "isp": "Cloudflare"
  }
}
```

---

## 2. 修改 CFIP

用于更新现有的 CFIP 信息。

- **URL**: `/api/cfip/{id}`
- **Method**: `PUT`
- **Headers**:
    - `Content-Type`: `application/json`
    - `X-API-Key`: `你的API密钥`

### 请求体 (JSON)

需要更新哪个字段就传哪个字段。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `address` | string | IP 地址或域名 |
| `port` | number | 端口 |
| `remark` | string | 备注 |
| `enabled` | boolean | 是否启用 |
| `sort_order` | number | 排序值 |
| `latency` | number | **新增** 延迟 (ms) |
| `speed` | number | **新增** 速度 (kB/s) |
| `country` | string | **新增** 国家代码 |
| `isp` | string | **新增** 运营商 |

**示例请求:**

```json
{
  "latency": 145,
  "speed": 6000
}
```

### 响应 (JSON)

```json
{
  "success": true
}
```

---

## 3. 说明

- **排序规则**：生成的订阅链接（VLESS/SS/ARGO）将默认按照 `speed` 字段降序排列（速度越快越靠前）。如果 `speed` 相同或为空，则按照 `sort_order` 升序排列。
- **单位说明**：
    - `latency`: 建议单位为毫秒 (ms)
    - `speed`: 建议单位为 kB/s 或 mB/s，保持统一即可，数值越大排序越靠前。
