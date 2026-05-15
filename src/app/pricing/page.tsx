import Link from 'next/link';
import { Navbar, Footer } from '@/components/StaticUI';
import { MembershipLeadForm } from '@/components/MembershipLeadForm';

const tiers = [
  {
    id: 'free',
    name: '免费体验',
    price: '¥0',
    desc: '适合先体验课程与本机进度闭环。',
    features: ['402 节课程全文阅读', '自然男声精华导读', '本机反思与完成记录', '分类浏览与每日课程'],
    cta: '开始体验',
    href: '/daily',
  },
  {
    id: 'annual',
    name: '清醒会员',
    price: '¥199 / 年',
    desc: '适合希望持续完成全年课程的人。',
    features: ['阶段复盘报告', '完整音频合集下载权益', '会员专属复盘模板', '月度主题陪跑与提醒'],
    cta: '记录会员意向',
    href: '#member-intent',
    highlighted: true,
  },
  {
    id: 'organization',
    name: '组织版',
    price: '定制',
    desc: '适合企业、社群、学校做心理韧性与成长训练。',
    features: ['组织学习看板', '成员进度与完成率', '私有化课程配置', '品牌化小程序与后台'],
    cta: '咨询组织版',
    href: '#member-intent',
  },
];

const leadProducts = tiers
  .filter((tier) => tier.id !== 'free')
  .map((tier) => ({
    id: tier.id,
    name: tier.name,
    price: tier.price,
  }));

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-warm/30">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <section className="mb-10">
          <p className="text-sage-dark text-sm font-medium mb-3">商业化闭环</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-4">从免费体验到会员复购</h1>
          <p className="text-muted max-w-2xl leading-relaxed">
            SoberMind 的商业化路径围绕一个核心动作：每天完成一次学习闭环。免费用户获得内容价值，会员获得复盘、陪跑、音频资产和组织管理能力。
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-parchment rounded-2xl p-6 border ${tier.highlighted ? 'border-sage/60' : 'border-bamboo'}`}
            >
              <div className="min-h-[132px]">
                <p className="font-serif text-xl font-bold text-ink">{tier.name}</p>
                <p className="font-serif text-3xl font-bold text-sage mt-3">{tier.price}</p>
                <p className="text-sm text-muted mt-3 leading-relaxed">{tier.desc}</p>
              </div>
              <ul className="space-y-3 my-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="text-sm text-ink/80 flex gap-2">
                    <span className="text-sage">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`block text-center rounded-xl px-4 py-3 text-sm font-medium ${tier.highlighted ? 'bg-sage text-zinc-950' : 'bg-bamboo/40 text-ink hover:bg-bamboo/70'}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </section>

        <section className="bg-parchment rounded-2xl p-6 sm:p-8 border border-bamboo">
          <h2 className="font-serif text-2xl font-bold text-ink mb-5">产品闭环</h2>
          <div className="grid sm:grid-cols-5 gap-3">
            {['进入今日课', '听男声导读', '阅读与练习', '反思打卡', '复盘与转化'].map((step, index) => (
              <div key={step} className="rounded-xl bg-warm/40 p-4 border border-bamboo">
                <p className="text-sage font-bold text-sm">0{index + 1}</p>
                <p className="text-ink font-medium mt-2">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6">
          <MembershipLeadForm products={leadProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
