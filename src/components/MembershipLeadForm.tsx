'use client';

import { FormEvent, useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: string;
};

type Lead = {
  productId: string;
  productName: string;
  contactName: string;
  contact: string;
  note: string;
  source: string;
  createdAt: number;
};

type Props = {
  products: Product[];
};

const leadStorageKey = 'sobermind:membershipLeads';
const intentStorageKey = 'sobermind:memberIntent';

function readLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.localStorage.getItem(leadStorageKey);
    return value ? JSON.parse(value) as Lead[] : [];
  } catch {
    return [];
  }
}

function writeLead(lead: Lead) {
  if (typeof window === 'undefined') return;
  const leads = readLeads();
  window.localStorage.setItem(leadStorageKey, JSON.stringify([lead, ...leads].slice(0, 50)));
  window.localStorage.setItem(intentStorageKey, JSON.stringify(lead));
}

async function syncLead(lead: Lead) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return false;

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/membership/lead`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(lead),
  });

  return response.ok;
}

export function MembershipLeadForm({ products }: Props) {
  const defaultProductId = products.find((product) => product.id === 'annual')?.id || products[0]?.id || '';
  const [productId, setProductId] = useState(defaultProductId);
  const [contactName, setContactName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) || products[0],
    [productId, products],
  );

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct || !contact.trim()) {
      setStatus('请留下微信号、手机号或邮箱，方便后续联系。');
      return;
    }

    const lead: Lead = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      contactName: contactName.trim(),
      contact: contact.trim(),
      note: note.trim(),
      source: 'web-pricing',
      createdAt: Date.now(),
    };

    setSubmitting(true);
    writeLead(lead);

    try {
      const synced = await syncLead(lead);
      setStatus(synced ? '已记录并同步到后端线索。' : '已记录到本机线索，配置后端后可自动同步。');
      setContactName('');
      setContact('');
      setNote('');
    } catch {
      setStatus('已记录到本机线索，后端暂时不可用。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="member-intent" className="bg-white rounded-2xl p-6 sm:p-8 border border-bamboo/20">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <div>
          <p className="text-sage-dark text-sm font-medium mb-3">线索收集</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">记录开通意向</h2>
          <p className="text-muted leading-relaxed">
            留下联系方式后会进入会员线索池，方便后续跟进个人会员、组织版合作和小程序上线服务。
          </p>
        </div>

        <form onSubmit={submitLead} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            {products.map((product) => (
              <label
                key={product.id}
                className={`cursor-pointer rounded-xl border p-4 ${productId === product.id ? 'border-sage bg-sage/5' : 'border-bamboo/20 bg-warm/30'}`}
              >
                <input
                  type="radio"
                  name="product"
                  value={product.id}
                  checked={productId === product.id}
                  onChange={() => setProductId(product.id)}
                  className="sr-only"
                />
                <span className="block text-ink font-medium">{product.name}</span>
                <span className="block text-sage font-bold mt-2">{product.price}</span>
              </label>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-ink mb-2">姓名</span>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className="w-full rounded-xl border border-bamboo/30 bg-white px-4 py-3 text-ink focus:outline-none focus:border-sage/60"
                placeholder="可选"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink mb-2">联系方式</span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                className="w-full rounded-xl border border-bamboo/30 bg-white px-4 py-3 text-ink focus:outline-none focus:border-sage/60"
                placeholder="微信 / 手机 / 邮箱"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-ink mb-2">需求备注</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full h-24 rounded-xl border border-bamboo/30 bg-white px-4 py-3 text-ink resize-y focus:outline-none focus:border-sage/60"
              placeholder="例如：个人年度会员、企业内训、社群小程序上线"
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-xl bg-sage px-5 py-3 text-white font-medium disabled:bg-bamboo disabled:text-muted"
            >
              {submitting ? '提交中' : '提交意向'}
            </button>
            {status && <p className="text-sm text-sage-dark">{status}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
