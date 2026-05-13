const http = require('http');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT || 8787);
const APPID = process.env.WECHAT_MINIPROGRAM_APPID;
const SECRET = process.env.WECHAT_MINIPROGRAM_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-before-production';

const MEMBERSHIP_PRODUCTS = [
  {
    id: 'annual',
    name: '清醒年度会员',
    price: '199',
    period: '年',
    desc: '阶段复盘、音频合集、会员模板与月度陪跑',
  },
  {
    id: 'lifetime',
    name: '终身会员',
    price: '699',
    period: '一次性',
    desc: '终身访问课程升级、音频资产与高级生命观内容',
  },
  {
    id: 'organization',
    name: '组织版',
    price: '定制',
    period: '团队',
    desc: '团队进度看板、私有课程和品牌化部署',
  },
];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
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

async function handleMembershipCheckout(request, response) {
  const { productId } = await readJson(request);
  const product = MEMBERSHIP_PRODUCTS.find((item) => item.id === productId);

  if (!product) {
    sendJson(response, 400, { error: '会员方案不存在' });
    return;
  }

  sendJson(response, 200, {
    mode: 'lead',
    orderId: `lead_${Date.now()}`,
    product,
    message: '示例后端已记录开通意向。接入微信支付后，请在此接口返回 wx.requestPayment 所需 paymentParams。',
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && request.url === '/api/membership/products') {
    sendJson(response, 200, { products: MEMBERSHIP_PRODUCTS });
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

  if (request.method === 'POST' && request.url === '/api/membership/checkout') {
    try {
      await handleMembershipCheckout(request, response);
    } catch (error) {
      sendJson(response, 500, { error: error.message || '会员开通失败' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`WeChat mini program example server listening on http://localhost:${PORT}`);
});
