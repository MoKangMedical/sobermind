const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');

const PORT = Number(process.env.PORT || 8787);
const APPID = process.env.WECHAT_MINIPROGRAM_APPID;
const SECRET = process.env.WECHAT_MINIPROGRAM_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-before-production';
const LEADS_FILE = process.env.MEMBERSHIP_LEADS_FILE || path.join(process.cwd(), '.runtime', 'membership-leads.jsonl');

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

async function appendJsonLine(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}

function getProduct(productId) {
  return MEMBERSHIP_PRODUCTS.find((item) => item.id === productId);
}

function buildLead(payload, source) {
  const product = getProduct(payload.productId);
  if (!product) {
    const error = new Error('会员方案不存在');
    error.statusCode = 400;
    throw error;
  }

  return {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    product,
    source,
    contactName: String(payload.contactName || '').trim(),
    contact: String(payload.contact || '').trim(),
    note: String(payload.note || '').trim(),
    createdAt: new Date().toISOString(),
  };
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

async function handleMembershipLead(request, response) {
  const payload = await readJson(request);
  const lead = buildLead(payload, payload.source || 'web-pricing');

  await appendJsonLine(LEADS_FILE, lead);

  sendJson(response, 200, {
    mode: 'lead',
    leadId: lead.id,
    product: lead.product,
    message: '会员意向已记录。',
  });
}

async function handleMembershipCheckout(request, response) {
  const payload = await readJson(request);
  const lead = buildLead(payload, payload.source || 'miniprogram-checkout');
  await appendJsonLine(LEADS_FILE, lead);

  sendJson(response, 200, {
    mode: 'lead',
    orderId: lead.id,
    product: lead.product,
    message: '示例后端已记录开通意向。接入微信支付后，请在此接口返回 wx.requestPayment 所需 paymentParams。',
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const urlPath = request.url ? request.url.split('?')[0] : '/';

  if (request.method === 'GET' && urlPath === '/api/membership/products') {
    sendJson(response, 200, { products: MEMBERSHIP_PRODUCTS });
    return;
  }

  if (request.method === 'POST' && urlPath === '/api/wechat/login') {
    try {
      await handleWechatLogin(request, response);
    } catch (error) {
      sendJson(response, 500, { error: error.message || '登录失败' });
    }
    return;
  }

  if (request.method === 'POST' && urlPath === '/api/membership/lead') {
    try {
      await handleMembershipLead(request, response);
    } catch (error) {
      sendJson(response, error.statusCode || 500, { error: error.message || '会员意向记录失败' });
    }
    return;
  }

  if (request.method === 'POST' && urlPath === '/api/membership/checkout') {
    try {
      await handleMembershipCheckout(request, response);
    } catch (error) {
      sendJson(response, error.statusCode || 500, { error: error.message || '会员开通失败' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`WeChat mini program example server listening on http://localhost:${PORT}`);
  console.log(`Membership leads will be written to ${LEADS_FILE}`);
});
