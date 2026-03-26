"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const plans = [
  {
    id: "free",
    name: "Free",
    tagline: "Start your journey",
    price: "$0",
    period: "forever",
    description:
      "Everything you need to explore the Digital Legacy experience at no cost.",
    cta: "Get Started — Free",
    ctaHref: "/signup",
    highlight: false,
    badge: null,
    features: [
      "1 AI persona",
      "10 voice conversations / month",
      "50 chat messages / month",
      "Browser-based voice synthesis",
      "Basic persona customisation",
      "Community support",
    ],
    missing: [
      "ElevenLabs HD voices",
      "Avatar generation",
      "Priority AI responses",
      "Analytics dashboard",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "For everyday conversations",
    price: "$9",
    period: "per month",
    description:
      "Unlock richer voices and more conversations for consistent daily use.",
    cta: "Start Basic Plan",
    ctaHref: "/signup",
    highlight: false,
    badge: null,
    features: [
      "5 AI personas",
      "100 voice conversations / month",
      "Unlimited chat messages",
      "ElevenLabs HD voices",
      "1 AI-generated avatar",
      "Advanced persona customisation",
      "Email support",
    ],
    missing: [
      "Priority AI responses",
      "Analytics dashboard",
    ],
  },
  {
    id: "basic-plus",
    name: "Basic Plus",
    tagline: "The full experience",
    price: "$19",
    period: "per month",
    description:
      "The complete Digital Legacy suite — unlimited conversations, premium voices, and real-time analytics.",
    cta: "Upgrade to Basic Plus",
    ctaHref: "/signup",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI personas",
      "Unlimited voice conversations",
      "Unlimited chat messages",
      "ElevenLabs HD voices",
      "5 AI-generated avatars / month",
      "Priority AI responses",
      "Full analytics dashboard",
      "Dedicated email & chat support",
      "Early access to new features",
    ],
    missing: [],
  },
];

const faqs = [
  {
    q: "Can I change my plan at any time?",
    a: "Yes — upgrades take effect immediately and downgrades apply at the end of your current billing cycle.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. All payments are processed through Stripe. We never store your card details.",
  },
  {
    q: "What happens if I exceed my monthly limits?",
    a: "On the Free plan, you'll be prompted to upgrade. On paid plans, we'll notify you before any overage charges apply.",
  },
  {
    q: "Do you offer a refund?",
    a: "We offer a 7-day money-back guarantee on all paid plans, no questions asked.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-12">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#a78bfa] mb-4">
          Transparent Pricing
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-5">
          Choose your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]">
            Legacy Plan
          </span>
        </h1>
        <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
          Start for free and scale as your conversations deepen. No hidden fees,
          no lock-in — cancel or switch anytime.
        </p>

        {/* Toggle (decorative — monthly only for now) */}
        <div className="inline-flex items-center gap-2 mt-8 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 text-sm text-[#94a3b8]">
          <span className="text-white font-medium">Monthly</span>
          <span className="mx-1 text-[#4b5563]">·</span>
          <span className="opacity-50">Annual</span>
          <span className="ml-2 text-[10px] font-bold tracking-wider bg-[#7c3aed] text-white px-2 py-0.5 rounded-full">
            SAVE 20%
          </span>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                plan.highlight
                  ? "border-[#7c3aed] bg-gradient-to-b from-[rgba(124,58,237,0.25)] to-[rgba(167,139,250,0.08)] shadow-[0_0_60px_rgba(124,58,237,0.3)] scale-[1.02]"
                  : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(167,139,250,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#a78bfa] mb-1">
                  {plan.tagline}
                </p>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {plan.name}
                </h2>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-[#64748b] text-sm mb-2 ml-1">
                    / {plan.period}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 mb-8 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                    : "bg-[rgba(255,255,255,0.07)] text-white border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.12)]"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Divider */}
              <div className="border-t border-[rgba(255,255,255,0.07)] mb-6" />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#cbd5e1]">
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0 text-[#a78bfa]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#374151]">
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0 text-[#374151]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <p className="text-center text-sm text-[#4b5563] mt-10">
          Secured by{" "}
          <span className="text-[#6b7280]">Stripe</span>
          {" · "}
          <span className="text-[#6b7280]">7-day money-back guarantee</span>
          {" · "}
          <span className="text-[#6b7280]">Cancel anytime</span>
        </p>
      </section>

      {/* Comparison callout */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-8 py-10">
          <h3 className="text-xl font-bold mb-2">Need a custom plan?</h3>
          <p className="text-[#64748b] text-sm mb-6">
            Running a business or building something large-scale? Talk to us
            about enterprise pricing, custom integrations, and SLA agreements.
          </p>
          <a
            href="mailto:hello@digitallegacy.ai"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#a78bfa] hover:text-white transition-colors"
          >
            Contact Sales
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-28">
        <h2 className="text-2xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-6">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="border-b border-[rgba(255,255,255,0.06)] pb-6 last:border-0"
            >
              <p className="font-semibold text-white mb-2">{faq.q}</p>
              <p className="text-sm text-[#64748b] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
