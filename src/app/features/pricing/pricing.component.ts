import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  description: string;
  cta: string;
  ctaStyle: 'primary' | 'outline' | 'ghost';
  highlighted: boolean;
  features: { text: string; included: boolean }[];
}

interface Competitor {
  name: string;
  xray: boolean;
  pdf: boolean;
  blood: boolean;
  plainLanguage: boolean;
  multiLang: boolean;
  freeTier: boolean;
  price: string;
  target: string;
  note: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero -->
    <section class="pricing-hero">
      <p class="eyebrow">Pricing & Plans</p>
      <h1>Simple, transparent pricing</h1>
      <p class="subtitle">Start free, upgrade when you need more. Every plan includes all three analysis modules — X-ray, PDF reports, and blood values.</p>

      <div class="billing-toggle">
        <button class="toggle-btn" [class.active]="billing === 'monthly'" (click)="billing = 'monthly'">Monthly</button>
        <button class="toggle-btn" [class.active]="billing === 'yearly'" (click)="billing = 'yearly'">
          Yearly
          <span class="save-badge">Save 25%</span>
        </button>
      </div>
    </section>

    <!-- Plans Grid -->
    <section class="plans-grid">
      <div
        *ngFor="let plan of plans"
        class="plan-card glass-card"
        [class.plan-highlighted]="plan.highlighted"
      >
        <div *ngIf="plan.badge" class="plan-badge">{{ plan.badge }}</div>

        <div class="plan-header">
          <h2 class="plan-name">{{ plan.name }}</h2>
          <div class="plan-price" *ngIf="plan.monthlyPrice !== null">
            <span class="price-amount">{{ displayPrice(plan) }}</span>
            <span class="price-period">/ mo</span>
          </div>
          <div class="plan-price" *ngIf="plan.monthlyPrice === null">
            <span class="price-amount price-custom">Custom</span>
          </div>
          <p *ngIf="billing === 'yearly' && plan.yearlyPrice" class="billed-note">
            Billed {{ yearlyBilled(plan) }}/year
          </p>
          <p class="plan-desc">{{ plan.description }}</p>
        </div>

        <ul class="feature-list">
          <li *ngFor="let f of plan.features" [class.excluded]="!f.included">
            <span class="feat-icon">{{ f.included ? '✓' : '✗' }}</span>
            {{ f.text }}
          </li>
        </ul>

        <button
          class="plan-cta"
          [class.btn-primary]="plan.ctaStyle === 'primary'"
          [class.btn-outline]="plan.ctaStyle === 'outline'"
          [class.btn-ghost]="plan.ctaStyle === 'ghost'"
        >
          {{ plan.cta }}
        </button>
      </div>
    </section>

    <!-- Feature Comparison Table -->
    <section class="comparison-section">
      <div class="section-header">
        <p class="eyebrow">Plan Comparison</p>
        <h2>Everything side by side</h2>
      </div>

      <div class="table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th class="feat-col">Feature</th>
              <th *ngFor="let plan of plans" [class.col-highlight]="plan.highlighted">
                {{ plan.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of comparisonRows">
              <td class="feat-label">{{ row.label }}</td>
              <td *ngFor="let val of row.values; let i = index" [class.col-highlight]="plans[i].highlighted">
                <span *ngIf="val === true" class="check yes">✓</span>
                <span *ngIf="val === false" class="check no">—</span>
                <span *ngIf="val !== true && val !== false" class="check text">{{ val }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Competitor Comparison -->
    <section class="competitor-section">
      <div class="section-header">
        <p class="eyebrow">Market Comparison</p>
        <h2>How ClariMed AI compares</h2>
        <p class="section-desc">A side-by-side look at similar apps on the market today.</p>
      </div>

      <div class="table-wrap">
        <table class="comparison-table competitor-table">
          <thead>
            <tr>
              <th>App / Platform</th>
              <th>X-Ray</th>
              <th>PDF Reports</th>
              <th>Blood Values</th>
              <th>Plain Language</th>
              <th>Multi-Language</th>
              <th>Free Tier</th>
              <th>Starting Price</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            <tr class="our-row">
              <td class="app-name">
                <span class="app-dot dot-us"></span>
                <strong>ClariMed AI</strong>
                <span class="our-tag">You are here</span>
              </td>
              <td><span class="check yes">✓</span></td>
              <td><span class="check yes">✓</span></td>
              <td><span class="check yes">✓</span></td>
              <td><span class="check yes">✓</span></td>
              <td><span class="check yes">✓</span></td>
              <td><span class="check yes">✓</span></td>
              <td><span class="price-tag free">Free</span></td>
              <td>Patients &amp; Clinics</td>
            </tr>
            <tr *ngFor="let c of competitors">
              <td class="app-name">
                <span class="app-dot"></span>
                {{ c.name }}
                <span *ngIf="c.note" class="comp-note">{{ c.note }}</span>
              </td>
              <td><span [class]="c.xray ? 'check yes' : 'check no'">{{ c.xray ? '✓' : '—' }}</span></td>
              <td><span [class]="c.pdf ? 'check yes' : 'check no'">{{ c.pdf ? '✓' : '—' }}</span></td>
              <td><span [class]="c.blood ? 'check yes' : 'check no'">{{ c.blood ? '✓' : '—' }}</span></td>
              <td><span [class]="c.plainLanguage ? 'check yes' : 'check no'">{{ c.plainLanguage ? '✓' : '—' }}</span></td>
              <td><span [class]="c.multiLang ? 'check yes' : 'check no'">{{ c.multiLang ? '✓' : '—' }}</span></td>
              <td><span [class]="c.freeTier ? 'check yes' : 'check no'">{{ c.freeTier ? '✓' : '—' }}</span></td>
              <td>
                <span [class]="c.price === 'Free' ? 'price-tag free' : 'price-tag paid'">{{ c.price }}</span>
              </td>
              <td>{{ c.target }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="disclaimer-note">Competitor data based on publicly available pricing as of 2025–2026. Prices subject to change.</p>
    </section>

    <!-- FAQ -->
    <section class="faq-section">
      <div class="section-header">
        <p class="eyebrow">FAQ</p>
        <h2>Frequently asked questions</h2>
      </div>
      <div class="faq-grid">
        <div class="faq-item glass-card" *ngFor="let faq of faqs">
          <h3>{{ faq.q }}</h3>
          <p>{{ faq.a }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner glass-card">
      <div class="cta-text">
        <h2>Start understanding your health today</h2>
        <p>No credit card required. Free plan includes 5 analyses per month across all modules.</p>
      </div>
      <div class="cta-actions">
        <button class="btn-primary cta-btn" routerLink="/">Try for Free</button>
        <button class="btn-outline cta-btn">Contact Sales</button>
      </div>
    </section>
  `,
  styles: [`
    /* ── Hero ── */
    .pricing-hero {
      text-align: center;
      padding: 3rem 0 2.5rem;
    }
    .pricing-hero h1 {
      font-size: var(--text-hero);
      font-weight: var(--weight-extrabold);
      line-height: var(--leading-tight);
      letter-spacing: var(--tracking-tight);
      background: linear-gradient(135deg, #0f172a 0%, #0284c7 55%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0.5rem 0 1rem;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: var(--tracking-eyebrow);
      font-size: var(--text-xs);
      color: var(--accent);
      font-weight: var(--weight-bold);
      margin-bottom: 0.75rem;
    }
    .subtitle {
      color: var(--text-muted);
      max-width: 52ch;
      margin: 0 auto 2rem;
      line-height: var(--leading-relaxed);
    }

    /* ── Billing toggle ── */
    .billing-toggle {
      display: inline-flex;
      background: rgba(2, 132, 199, 0.07);
      border: 1px solid rgba(2, 132, 199, 0.15);
      border-radius: var(--radius-pill);
      padding: 4px;
      gap: 4px;
    }
    .toggle-btn {
      padding: 0.5rem 1.4rem;
      border-radius: var(--radius-pill);
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .toggle-btn.active {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
    }
    .save-badge {
      background: rgba(5, 150, 105, 0.15);
      color: var(--secondary);
      font-size: 0.65rem;
      font-weight: var(--weight-bold);
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .toggle-btn.active .save-badge {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }

    /* ── Plans grid ── */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0 3rem;
      align-items: start;
    }
    .plan-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem 1.75rem;
      border-top: 3px solid rgba(2, 132, 199, 0.15);
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .plan-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(2, 132, 199, 0.12), 0 2px 8px rgba(0,0,0,0.06);
    }
    .plan-highlighted {
      border-top-color: var(--primary) !important;
      background: linear-gradient(160deg, #fff 0%, rgba(224, 242, 254, 0.55) 100%) !important;
      box-shadow: 0 8px 40px rgba(2, 132, 199, 0.14), 0 2px 8px rgba(0,0,0,0.06) !important;
    }
    .plan-badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: #fff;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      padding: 4px 14px;
      border-radius: var(--radius-pill);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      white-space: nowrap;
    }
    .plan-name {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--text-main);
    }
    .plan-price {
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
      margin: 0.5rem 0 0;
    }
    .price-amount {
      font-size: var(--text-4xl);
      font-weight: var(--weight-extrabold);
      color: var(--text-main);
      line-height: 1;
    }
    .price-amount.price-custom {
      font-size: var(--text-3xl);
      color: var(--primary);
    }
    .price-period {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
    .billed-note {
      font-size: var(--text-xs);
      color: var(--secondary);
      font-weight: var(--weight-semibold);
      margin-top: 0.25rem;
    }
    .plan-desc {
      font-size: var(--text-sm);
      color: var(--text-muted);
      line-height: var(--leading-relaxed);
      margin-top: 0.5rem;
    }
    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      flex: 1;
    }
    .feature-list li {
      font-size: var(--text-sm);
      color: var(--text-soft);
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      line-height: var(--leading-relaxed);
    }
    .feature-list li.excluded {
      color: var(--text-muted);
      opacity: 0.6;
    }
    .feat-icon {
      flex: 0 0 auto;
      font-size: var(--text-sm);
      width: 18px;
      text-align: center;
      color: var(--secondary);
      font-weight: var(--weight-bold);
    }
    .feature-list li.excluded .feat-icon {
      color: var(--text-muted);
    }
    .plan-cta {
      width: 100%;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-control);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      transition: all 0.18s;
      border: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
      border: none;
    }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline {
      background: transparent;
      color: var(--primary);
      border: 1.5px solid var(--primary);
    }
    .btn-outline:hover { background: rgba(2, 132, 199, 0.06); }
    .btn-ghost {
      background: rgba(2, 132, 199, 0.06);
      color: var(--text-soft);
      border: 1.5px solid rgba(2, 132, 199, 0.12);
    }
    .btn-ghost:hover { background: rgba(2, 132, 199, 0.1); }

    /* ── Section headers ── */
    .comparison-section,
    .competitor-section,
    .faq-section { margin: 4rem 0; }
    .section-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    .section-header h2 {
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      line-height: var(--leading-snug);
      margin: 0.4rem 0 0.6rem;
    }
    .section-desc {
      color: var(--text-muted);
      max-width: 55ch;
      margin: 0 auto;
      line-height: var(--leading-relaxed);
    }

    /* ── Tables ── */
    .table-wrap {
      overflow-x: auto;
      border-radius: var(--radius-card);
      border: 1px solid rgba(2, 132, 199, 0.12);
      box-shadow: var(--shadow-card);
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surface);
      font-size: var(--text-sm);
    }
    .comparison-table thead {
      background: linear-gradient(90deg, rgba(2, 132, 199, 0.06), rgba(5, 150, 105, 0.04));
    }
    .comparison-table th {
      padding: 1rem 1.25rem;
      text-align: center;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wider);
      color: var(--text-soft);
      border-bottom: 1px solid rgba(2, 132, 199, 0.1);
      white-space: nowrap;
    }
    .comparison-table th.feat-col,
    .comparison-table td.feat-label { text-align: left; }
    .comparison-table td {
      padding: 0.85rem 1.25rem;
      text-align: center;
      border-bottom: 1px solid rgba(2, 132, 199, 0.06);
      color: var(--text-soft);
      vertical-align: middle;
    }
    .comparison-table tr:last-child td { border-bottom: none; }
    .comparison-table tr:hover td { background: rgba(2, 132, 199, 0.025); }
    .col-highlight {
      background: rgba(2, 132, 199, 0.04);
    }
    .feat-label {
      font-weight: var(--weight-medium);
      color: var(--text-main);
      white-space: nowrap;
    }
    .check {
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
      display: inline-block;
    }
    .check.yes { color: var(--secondary); }
    .check.no  { color: var(--text-muted); opacity: 0.45; }
    .check.text { color: var(--text-soft); font-size: var(--text-sm); font-weight: var(--weight-medium); }

    /* ── Competitor table extras ── */
    .competitor-table th { white-space: nowrap; }
    .app-name {
      text-align: left !important;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .app-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
      flex: 0 0 auto;
      background: rgba(2, 132, 199, 0.25);
    }
    .dot-us { background: var(--primary); }
    .our-row { background: linear-gradient(90deg, rgba(224,242,254,0.55), rgba(220,252,231,0.25)); }
    .our-row td { font-weight: var(--weight-medium); }
    .our-tag {
      background: rgba(2, 132, 199, 0.1);
      color: var(--primary);
      font-size: 0.65rem;
      font-weight: var(--weight-bold);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .comp-note {
      background: rgba(217, 119, 6, 0.08);
      color: var(--accent);
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      font-weight: var(--weight-semibold);
    }
    .price-tag {
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      padding: 3px 9px;
      border-radius: var(--radius-pill);
      white-space: nowrap;
    }
    .price-tag.free { background: rgba(5, 150, 105, 0.1); color: var(--secondary); }
    .price-tag.paid { background: rgba(2, 132, 199, 0.1); color: var(--primary); }
    .disclaimer-note {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: 1rem;
      text-align: center;
    }

    /* ── FAQ ── */
    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .faq-item {
      padding: 1.5rem;
    }
    .faq-item h3 {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      margin-bottom: 0.6rem;
      color: var(--text-main);
    }
    .faq-item p {
      font-size: var(--text-sm);
      color: var(--text-muted);
      line-height: var(--leading-relaxed);
    }

    /* ── CTA Banner ── */
    .cta-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      padding: 2.5rem 2.5rem;
      margin: 4rem 0;
      background: linear-gradient(135deg, rgba(224, 242, 254, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%) !important;
      border-top: 3px solid var(--primary);
      flex-wrap: wrap;
    }
    .cta-text h2 {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      margin-bottom: 0.4rem;
    }
    .cta-text p {
      color: var(--text-muted);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
    }
    .cta-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .cta-btn {
      padding: 0.8rem 1.8rem;
      border-radius: var(--radius-control);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      transition: all 0.18s;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .pricing-hero h1 { font-size: var(--text-display); }
      .plans-grid { grid-template-columns: 1fr; }
      .cta-banner { flex-direction: column; text-align: center; }
      .cta-actions { justify-content: center; }
    }
  `]
})
export class PricingComponent {
  billing: 'monthly' | 'yearly' = 'monthly';

  plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for trying out ClariMed AI at no cost.',
      cta: 'Get Started Free',
      ctaStyle: 'ghost',
      highlighted: false,
      features: [
        { text: '5 analyses per month', included: true },
        { text: 'X-Ray image analysis', included: true },
        { text: 'PDF report analyzer', included: true },
        { text: 'Blood values analyzer', included: true },
        { text: 'Plain-language summaries', included: true },
        { text: 'PDF export of results', included: false },
        { text: 'Analysis history', included: false },
        { text: 'Priority processing', included: false },
        { text: 'Multi-language output', included: false },
        { text: 'API access', included: false },
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 7,
      yearlyPrice: 5,
      description: 'For individuals who regularly need to review medical results.',
      cta: 'Start Starter Plan',
      ctaStyle: 'outline',
      highlighted: false,
      features: [
        { text: '30 analyses per month', included: true },
        { text: 'X-Ray image analysis', included: true },
        { text: 'PDF report analyzer', included: true },
        { text: 'Blood values analyzer', included: true },
        { text: 'Plain-language summaries', included: true },
        { text: 'PDF export of results', included: true },
        { text: '30-day analysis history', included: true },
        { text: 'Priority processing', included: false },
        { text: 'Multi-language output', included: false },
        { text: 'API access', included: false },
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Most Popular',
      monthlyPrice: 19,
      yearlyPrice: 14,
      description: 'Unlimited analyses plus advanced features for power users.',
      cta: 'Upgrade to Pro',
      ctaStyle: 'primary',
      highlighted: true,
      features: [
        { text: 'Unlimited analyses', included: true },
        { text: 'X-Ray image analysis', included: true },
        { text: 'PDF report analyzer', included: true },
        { text: 'Blood values analyzer', included: true },
        { text: 'Plain-language summaries', included: true },
        { text: 'PDF export of results', included: true },
        { text: 'Full analysis history', included: true },
        { text: 'Priority processing', included: true },
        { text: 'Multi-language output', included: true },
        { text: 'API access', included: false },
      ]
    },
    {
      id: 'clinic',
      name: 'Clinic',
      monthlyPrice: null,
      yearlyPrice: null,
      description: 'For medical practices, hospitals, and health platforms needing team access.',
      cta: 'Contact Sales',
      ctaStyle: 'outline',
      highlighted: false,
      features: [
        { text: 'Unlimited analyses', included: true },
        { text: 'All three modules', included: true },
        { text: 'Team & multi-user access', included: true },
        { text: 'PDF export of results', included: true },
        { text: 'Full analysis history', included: true },
        { text: 'Priority processing', included: true },
        { text: 'Multi-language output', included: true },
        { text: 'REST API access', included: true },
        { text: 'HIPAA compliance support', included: true },
        { text: 'Dedicated support & SLA', included: true },
      ]
    }
  ];

  comparisonRows = [
    { label: 'Analyses per month',    values: ['5',      '30',      'Unlimited', 'Unlimited'] },
    { label: 'X-Ray analysis',         values: [true,     true,      true,        true] },
    { label: 'PDF report analyzer',    values: [true,     true,      true,        true] },
    { label: 'Blood values analyzer',  values: [true,     true,      true,        true] },
    { label: 'Plain-language summary', values: [true,     true,      true,        true] },
    { label: 'Key findings',           values: [true,     true,      true,        true] },
    { label: 'Recommended next steps', values: [true,     true,      true,        true] },
    { label: 'PDF export',             values: [false,    true,      true,        true] },
    { label: 'Analysis history',       values: [false,    '30 days', 'Unlimited', 'Unlimited'] },
    { label: 'Priority processing',    values: [false,    false,     true,        true] },
    { label: 'Multi-language output',  values: [false,    false,     true,        true] },
    { label: 'Team / multi-user',      values: [false,    false,     false,       true] },
    { label: 'REST API access',        values: [false,    false,     false,       true] },
    { label: 'HIPAA compliance',       values: [false,    false,     false,       true] },
    { label: 'Dedicated support',      values: [false,    false,     false,       true] },
  ];

  competitors: Competitor[] = [
    {
      name: 'Kantesti',
      xray: false, pdf: false, blood: true,
      plainLanguage: true, multiLang: true, freeTier: true,
      price: '€4.99/mo', target: 'Patients',
      note: 'Blood only'
    },
    {
      name: 'Medsplain',
      xray: false, pdf: true, blood: false,
      plainLanguage: true, multiLang: false, freeTier: true,
      price: 'Free', target: 'Patients',
      note: 'PDF/text only'
    },
    {
      name: 'VitaDash',
      xray: false, pdf: false, blood: true,
      plainLanguage: true, multiLang: false, freeTier: false,
      price: '$8.25/mo', target: 'Wellness',
      note: 'Labs + supplements'
    },
    {
      name: 'BloodAI Analytics',
      xray: false, pdf: false, blood: true,
      plainLanguage: true, multiLang: false, freeTier: false,
      price: '$79.90/yr', target: 'Patients',
      note: '20 analyses/yr'
    },
    {
      name: 'SiPhox Health',
      xray: false, pdf: false, blood: true,
      plainLanguage: true, multiLang: false, freeTier: true,
      price: '$125/yr', target: 'Wellness',
      note: '2 free uploads'
    },
    {
      name: 'Glass Health',
      xray: false, pdf: true, blood: false,
      plainLanguage: false, multiLang: false, freeTier: true,
      price: '$29/mo', target: 'Clinicians',
      note: 'Clinical use only'
    },
    {
      name: 'Patiently AI',
      xray: false, pdf: true, blood: false,
      plainLanguage: true, multiLang: false, freeTier: false,
      price: 'Enterprise', target: 'Providers',
      note: 'MHRA registered'
    },
    {
      name: 'Navina AI',
      xray: false, pdf: true, blood: false,
      plainLanguage: false, multiLang: false, freeTier: false,
      price: 'Custom', target: 'Health systems',
      note: 'Enterprise only'
    },
  ];

  displayPrice(plan: Plan): string {
    const p = this.billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return p !== null ? '$' + p : '';
  }

  yearlyBilled(plan: Plan): string {
    return '$' + (plan.yearlyPrice || 0) * 12;
  }

  faqs = [
    {
      q: 'Is ClariMed AI a medical diagnosis tool?',
      a: 'No. ClariMed AI helps you understand what your medical reports say in plain language. It is not a diagnostic tool and does not replace a licensed doctor or clinician.'
    },
    {
      q: 'What happens when I reach my monthly limit?',
      a: 'Your analyses are paused until the next billing cycle resets your count. You can upgrade at any time to get more analyses immediately.'
    },
    {
      q: 'Can I switch plans at any time?',
      a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time from your account settings. Upgrades take effect immediately; downgrades apply at the next billing cycle.'
    },
    {
      q: 'Is my medical data secure?',
      a: 'All uploads are encrypted in transit and at rest. Free and Starter plans retain data for processing only. Pro and Clinic plans include full data retention controls.'
    },
    {
      q: 'Does the yearly plan auto-renew?',
      a: 'Yes, yearly plans auto-renew unless cancelled at least 7 days before the renewal date. You can manage this in your account settings.'
    },
    {
      q: 'What file formats are supported?',
      a: 'X-Ray analysis accepts JPEG, PNG, and WEBP. PDF Report analysis accepts standard PDF files. Blood values can be entered manually or uploaded as a PDF lab report.'
    },
  ];
}
