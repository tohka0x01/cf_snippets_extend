/**
 * Argo Tunnel VLESS 订阅生成器
 * 从 CF Snippets Extend 获取 CFIP 信息，生成完整的 VLESS 订阅链接
 * 需要使用 SNIPPETS_API_KEY 进行身份验证
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 健康检查不需要认证
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 登录接口
    if (path === '/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // 登出接口
    if (path === '/logout') {
      return handleLogout();
    }

    // 根路径返回登录页面
    if (path === '/') {
      return handleIndex(request, env);
    }

    // 订阅接口需要认证
    if (path === '/sub' || path === '/subscribe') {
      // 验证身份
      if (!await verifyAuth(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return handleSubscribe(env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

/**
 * 验证身份
 * 支持三种方式：
 * 1. Cookie 中的 auth_token
 * 2. URL 参数中的 token
 * 3. Header 中的 X-API-Key
 */
async function verifyAuth(request, env) {
  const apiKey = env.SNIPPETS_API_KEY;
  if (!apiKey) return false;

  // 方式1: 检查 Cookie
  const cookies = request.headers.get('Cookie') || '';
  const cookieMatch = cookies.match(/auth_token=([^;]+)/);
  if (cookieMatch && cookieMatch[1] === apiKey) {
    return true;
  }

  // 方式2: 检查 URL 参数
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam === apiKey) {
    return true;
  }

  // 方式3: 检查 Header
  const headerKey = request.headers.get('X-API-Key');
  if (headerKey === apiKey) {
    return true;
  }

  return false;
}

/**
 * 处理登录
 */
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || apiKey !== env.SNIPPETS_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid API Key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 登录成功，设置 Cookie
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${apiKey}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 处理登出
 */
function handleLogout() {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    }
  });
}

/**
 * 处理首页
 */
async function handleIndex(request, env) {
  const isAuthenticated = await verifyAuth(request, env);

  if (!isAuthenticated) {
    // 返回登录页面
    return new Response(getLoginHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 返回主页面
  return new Response(getMainHTML(request.url, env), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * 登录页面 HTML
 */
function getLoginHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - Argo VLESS 订阅</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .login-container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 30px;
      font-size: 24px;
    }
    .project-link {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }
    .project-link a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s;
    }
    .project-link a:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 16px;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) {
      background: #5568d3;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: none;
    }
    .alert-error {
      background: #ffebee;
      color: #c62828;
    }
    .alert-success {
      background: #e8f5e9;
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>🔐 登录</h1>
    <div id="alert" class="alert"></div>
    <form id="loginForm">
      <div class="form-group">
        <label>API Key</label>
        <input type="password" id="apiKey" placeholder="请输入 API Key" required>
      </div>
      <button type="submit">登录</button>
    </form>
    <div class="project-link">
      <a href="https://github.com/assast/cf_snippets_extend" target="_blank">
        <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        GitHub 项目
      </a>
    </div>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const apiKey = document.getElementById('apiKey').value;
      const alert = document.getElementById('alert');
      const submitBtn = e.target.querySelector('button[type="submit"]');

      // 禁用按钮，显示加载状态
      submitBtn.disabled = true;
      submitBtn.textContent = '登录中...';
      
      alert.className = 'alert alert-success';
      alert.textContent = '⏳ 正在验证...';
      alert.style.display = 'block';

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey })
        });

        const data = await response.json();

        if (data.success) {
          alert.className = 'alert alert-success';
          alert.textContent = '✅ 登录成功，正在跳转...';
          alert.style.display = 'block';
          setTimeout(() => location.reload(), 1000);
        } else {
          alert.className = 'alert alert-error';
          alert.textContent = '❌ ' + (data.error || '登录失败');
          alert.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = '登录';
        }
      } catch (error) {
        alert.className = 'alert alert-error';
        alert.textContent = '❌ 网络错误：' + error.message;
        alert.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = '登录';
      }
    });
  </script>
</body>
</html>`;
}

/**
 * 主页面 HTML
 */
function getMainHTML(baseUrl, env) {
  const url = new URL(baseUrl);
  const subUrl = `${url.origin}/sub`;
  const subUrlWithToken = `${url.origin}/sub?token=${env.SNIPPETS_API_KEY}`;
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Argo VLESS 订阅</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      color: #667eea;
      font-size: 24px;
    }
    .panel {
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .panel h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 16px;
    }
    .info-box {
      background: #f7f9fc;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .info-box p {
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .info-box strong {
      color: #667eea;
    }
    .url-box {
      background: #e8f0fe;
      padding: 12px;
      border-radius: 6px;
      font-family: monospace;
      word-break: break-all;
      margin: 8px 0;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5568d3;
    }
    .btn-danger {
      background: #f14668;
      color: white;
    }
    .btn-danger:hover {
      background: #ef2e4a;
    }
    .btn-success {
      background: #48c774;
      color: white;
    }
    .btn-success:hover {
      background: #3abb67;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }
    .alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: none;
    }
    .alert-success {
      background: #e8f5e9;
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📡 Argo VLESS 订阅</h1>
      <div style="display: flex; gap: 10px; align-items: center;">
        <a href="https://github.com/assast/cf_snippets_extend" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #24292e; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; transition: all 0.2s;">
          <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          GitHub
        </a>
        <button class="btn btn-danger" onclick="logout()">退出登录</button>
      </div>
    </div>

    <div class="panel">
      <h2>订阅信息</h2>
      <div id="alert" class="alert"></div>
      
      <div class="info-box">
        <p><strong>订阅地址：</strong></p>
        <div class="url-box" id="subUrl">${subUrl}</div>
        
        <p style="margin-top: 16px"><strong>使用说明：</strong></p>
        <p>1. 复制上方订阅地址</p>
        <p>2. 在 V2Ray/Clash 等客户端中添加订阅</p>
        <p>3. 更新订阅即可获取所有启用的 CFIP 节点</p>
        
        <p style="margin-top: 16px"><strong>带 Token 的订阅地址：</strong></p>
        <div class="url-box" id="subUrlWithToken">${subUrlWithToken}</div>
        <p style="font-size: 12px; color: #666; margin-top: 8px">
          注意：此地址包含 API Key，可以在客户端中直接使用而无需登录，请妥善保管
        </p>
      </div>

      <div class="actions">
        <button class="btn btn-success" onclick="copyUrl()">📋 复制订阅地址</button>
        <button class="btn btn-success" onclick="copyUrlWithToken()">📋 复制带Token地址</button>
        <button class="btn btn-primary" onclick="testSubscription()">🔄 测试订阅</button>
      </div>
    </div>

    <div class="panel">
      <h2>节点格式</h2>
      <div class="info-box">
        <p><strong>VLESS 链接格式：</strong></p>
        <code style="display: block; background: white; padding: 12px; border-radius: 4px; font-size: 12px; word-break: break-all; margin-top: 8px;">
          vless://UUID@CFIP地址:端口?encryption=none&security=tls&sni=ARGO_DOMAIN&fp=firefox&type=ws&host=ARGO_DOMAIN&path=%2Fvless-argo%3Fed%3D2560#NC-US-ARGO-备注
        </code>
      </div>
    </div>
  </div>

  <script>
    function copyUrl() {
      const url = document.getElementById('subUrl').textContent;
      navigator.clipboard.writeText(url).then(() => {
        showAlert('✅ 订阅地址已复制到剪贴板');
      }).catch(err => {
        showAlert('❌ 复制失败：' + err.message);
      });
    }

    function copyUrlWithToken() {
      const url = document.getElementById('subUrlWithToken').textContent;
      navigator.clipboard.writeText(url).then(() => {
        showAlert('✅ 带Token的订阅地址已复制到剪贴板');
      }).catch(err => {
        showAlert('❌ 复制失败：' + err.message);
      });
    }

    async function testSubscription() {
      const alert = document.getElementById('alert');
      alert.style.display = 'block';
      alert.className = 'alert alert-success';
      alert.textContent = '⏳ 正在测试订阅...';

      try {
        const response = await fetch('/sub');
        if (response.ok) {
          const data = await response.text();
          try {
            const decoded = atob(data);
            const count = decoded.split('\\n').filter(line => line.trim()).length;
            showAlert(\`✅ 订阅测试成功！共 \${count} 个节点\`);
          } catch (e) {
            showAlert('✅ 订阅测试成功！但无法解析节点数量');
          }
        } else {
          const errorText = await response.text();
          let errorMsg = '订阅测试失败：' + response.status;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMsg = '❌ ' + errorJson.error;
              if (errorJson.details) {
                errorMsg += '\\n详情：' + errorJson.details;
              }
            }
          } catch (e) {
            errorMsg = '❌ ' + errorMsg;
          }
          showAlert(errorMsg);
        }
      } catch (error) {
        showAlert('❌ 订阅测试失败：' + error.message);
      }
    }

    async function logout() {
      try {
        await fetch('/logout');
        showAlert('✅ 已退出登录，正在刷新...');
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showAlert('❌ 登出失败：' + error.message);
      }
    }

    function showAlert(message) {
      const alert = document.getElementById('alert');
      alert.className = 'alert alert-success';
      alert.innerHTML = message.replace(/\\n/g, '<br>');
      alert.style.display = 'block';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 5000);
    }
  </script>
</body>
</html>`;
}

async function handleSubscribe(env) {
  try {
    // 从环境变量获取配置
    const uuid = env.UUID;
    const argoDomain = env.ARGO_DOMAIN;
    const snippetsApiUrl = env.SNIPPETS_API_URL;
    const snippetsApiKey = env.SNIPPETS_API_KEY;

    // 验证必要的环境变量
    if (!uuid || !argoDomain || !snippetsApiUrl || !snippetsApiKey) {
      return new Response(
        JSON.stringify({
          error: 'Missing required environment variables',
          required: ['UUID', 'ARGO_DOMAIN', 'SNIPPETS_API_URL', 'SNIPPETS_API_KEY']
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 调用 CF Snippets Extend 内部接口获取启用的 CFIP
    const apiUrl = `${snippetsApiUrl}/api/internal/cfip?key=${snippetsApiKey}`;
    
    const cfipResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!cfipResponse.ok) {
      const errorText = await cfipResponse.text();
      return new Response(
        JSON.stringify({
          error: `Failed to fetch CFIP data: ${cfipResponse.status}`,
          details: errorText
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cfipData = await cfipResponse.json();

    if (!cfipData.success || !Array.isArray(cfipData.data)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid response from CFIP API',
          response: cfipData
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 过滤启用的 CFIP (enabled === 1)
    const enabledCfips = cfipData.data.filter(cfip => cfip.enabled === 1);

    if (enabledCfips.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No enabled CFIP found',
          total: cfipData.data.length
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成 VLESS 订阅链接
    const links = generateVlessLinks(uuid, argoDomain, enabledCfips);

    // 返回 Base64 编码的订阅内容
    const subscriptionContent = links.join('\n');
    const base64Content = btoa(subscriptionContent);

    return new Response(base64Content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    console.error('Error in handleSubscribe:', error);
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${error.message}`,
        stack: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function generateVlessLinks(uuid, argoDomain, cfips) {
  const links = [];
  const path = '/vless-argo?ed=2560';

  for (const cfip of cfips) {
    // 处理 IPv6 地址
    let host = cfip.address;
    if (host.includes(':') && !host.startsWith('[')) {
      host = `[${host}]`;
    }

    const port = cfip.port || 443;
    const remark = cfip.remark || cfip.address;

    // 构建 VLESS 链接
    // 格式: vless://UUID@CFIP地址:CFIP端口?encryption=none&security=tls&sni=ARGO_DOMAIN&fp=firefox&type=ws&host=ARGO_DOMAIN&path=%2Fvless-argo%3Fed%3D2560#NC-US-ARGO-CFIP的备注
    const vlessLink = `vless://${uuid}@${host}:${port}?encryption=none&security=tls&sni=${argoDomain}&fp=firefox&type=ws&host=${argoDomain}&path=${encodeURIComponent(path)}#${encodeURIComponent(`NC-US-ARGO-${remark}`)}`;

    links.push(vlessLink);
  }

  return links;
}
