# 更新日志

## 2026-05-21

### 新增

- CFIP 管理页面新增“删除失败≥X”操作，可按失败次数阈值批量删除记录。
- 新增 CFIP 按失败次数阈值批量删除接口：`POST /api/cfip/batch/delete-by-fail-count`。
- 新增阈值删除回归测试，覆盖 `fail_count >= X` 的删除逻辑。

## 2026-05-12

### 新增

- CFIP 新增节点黑名单字段 `node_blacklisted`，与原有 DNS 黑名单独立生效。
- CFIP 管理页面新增节点黑名单展示、筛选、单条操作和批量操作。
- 新增黑名单拆分回归测试，覆盖 DNS 同步过滤与订阅过滤分离逻辑。

### 变更

- 原 `sync_blacklisted` 明确作为 DNS 黑名单，`/api/internal/cfip` 和 DNS/CF 同步只受该字段影响。
- VLESS、SS、ARGO、Token 订阅和订阅生成接口改为默认按 `node_blacklisted` 过滤 CFIP。
- `include_blacklisted_cfip` 的语义调整为“是否包含节点黑名单 CFIP”。
- CFIP 拉黑接口支持通过 `blacklist_type` 区分 DNS 黑名单和节点黑名单。

### 兼容性

- 旧请求体中的 `sync_blacklisted` 和 `blacklisted` 继续兼容为 DNS 黑名单写法。
- 导入导出格式新增 `node_blacklisted`；旧数据未提供该字段时按 `0` 处理。

## 2026-05-04

### 新增

- 新增 CFIP 同步黑名单字段 `sync_blacklisted`。
- 新增单条 CFIP 拉黑/解黑接口：`POST /api/cfip/{id}/blacklist`。
- 新增批量 CFIP 拉黑/解黑接口：`POST /api/cfip/batch/blacklist`。
- 内部 CFIP 同步接口 `GET /api/internal/cfip` 新增 `X-Internal-Key` 鉴权支持。
- 管理页面列表视图和卡片视图新增 CFIP 拉黑/解黑操作。
- 管理页面新增 CFIP 黑名单状态展示和排序。
- 导入数据时兼容 `sync_blacklisted` 字段和旧别名 `blacklisted`。
- 新增订阅配置字段 `include_blacklisted_cfip`，可控制该订阅是否包含已拉黑 CFIP。
- VLESS/SS 订阅配置弹窗新增“拉黑 CFIP 参与订阅生成”选项。
- ARGO 订阅卡片新增“包含/排除拉黑 CFIP”切换按钮。
- CFIP 管理列表新增“CF同步”筛选，可按可同步/已拉黑状态过滤。

### 变更

- 内部 CFIP 同步现在只返回未拉黑的 CFIP。
- VLESS、SS、ARGO、Token 订阅和订阅生成接口默认排除已拉黑 CFIP；开启 `include_blacklisted_cfip = 1` 后可包含已拉黑 CFIP。
- 显式订阅参数 `?cfip=1,2,3` 仍然不检查 CFIP 状态；是否包含已拉黑 CFIP 由订阅配置决定。
- 公开订阅 URL 支持通过 `include_blacklisted_cfip=1` 临时覆盖订阅配置，包含已拉黑 CFIP。
- Telegram CFIP 导入现在写入 `status = 'enabled'` 和 `sync_blacklisted = 0`。
- 布尔类 API 字段现在支持大小写不敏感的字符串 `true`，以及数字/字符串 `1`。
- 管理页面主容器改为更宽的布局，并减少左右留白，提升宽屏空间利用率。

### 兼容性

- 现有 CFIP 数据保持兼容：`sync_blacklisted IS NULL` 会按未拉黑处理。
- 新建 D1 表会创建 `sync_blacklisted INTEGER DEFAULT 0` 和 `include_blacklisted_cfip INTEGER DEFAULT 0`；已有表通过 `ALTER TABLE` 自动补列。
- `blacklisted` 仍作为 `sync_blacklisted` 的请求体兼容别名。
- `includeBlacklistedCfip` 作为 `include_blacklisted_cfip` 的请求体兼容别名。

### 说明

- 黑名单更新响应包含 `changes`；`changes = 0` 表示请求成功，但没有匹配到实际被更新的 CFIP 记录。
- `/api/internal/cfip` 不受 `include_blacklisted_cfip` 影响，始终排除已拉黑 CFIP。
- 生成 VLESS/SS 订阅时，如果请求体未传 `include_blacklisted_cfip`，会保留已有订阅配置值；没有已有配置时默认排除已拉黑 CFIP。
- 公开订阅 URL 参数 `include_blacklisted_cfip` 和 `includeBlacklistedCfip` 只影响当前请求，不会写入数据库。
