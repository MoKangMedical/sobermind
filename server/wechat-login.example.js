const http = require('http');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT || 8787);
const APPID = process.env.WECHAT_MINIPROGRAM_APPID;
const SECRET = process.env.WECHAT_MINIPROGRAM_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-before-production';

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

async function code2Session(code) {
  if (!APPID || !SECRET) {
    throw new Error('请配置 WECHAT_MINIPROGRAM_APPID 和 WECHAT_MINIPROGRAM_SECRET');
  }

  const params = new URLSearchParams({
    appid: APPID,
    secret: SECRET,
    js_code: code,
    grant_type: 'authorization_code',
  });

  const response = await fetch(`https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || payload.errcode) {
    throw new Error(payload.errmsg || `code2Session 失败：${response.status}`);
  }

  return payload;
}

async function handleWechatLogin(request, response) {
  const { code } = await readJson(request);
  if (!code) {
    sendJson(response, 400, { error: '缺少 wx.login code' });
    return;
  }

  const session = await code2Session(code);
  const token = jwt.sign(
    {
      openid: session.openid,
      unionid: session.unionid,
    },
    JWT_SECRET,
    { expiresIn: '30d' },
  );

  sendJson(response, 200, {
    token,
    user: {
      openid: session.openid,
      unionid: session.unionid || '',
    },
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'POST' && request.url === '/api/wechat/login') {
    try {
      await handleWechatLogin(request, response);
    } catch (error) {
      sendJson(response, 500, { error: error.message || '登录失败' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`WeChat login example server listening on http://localhost:${PORT}`);
});
