import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">ClariMed AI</p>
        <h1>Clear medical insights from scans, reports, and blood tests.</h1>
        <p class="page-subtitle">Upload a medical X-ray, analyze a clinical report, or enter blood values manually. Each workflow validates the file first, highlights the key findings, and explains the result in simple words without pretending to diagnose.</p>
      </div>
      <div class="hero-panel glass-card">
        <div class="metric">
          <span>Modules</span>
          <strong>X-ray, PDF, Blood values</strong>
        </div>
        <div class="metric">
          <span>Pipeline</span>
          <strong>Extract, validate, simplify</strong>
        </div>
        <div class="metric">
          <span>Outputs</span>
          <strong>Summary, findings, meaning, next steps</strong>
        </div>
      </div>
    </section>

    <div class="dashboard-header">
      <h2>Choose a workflow</h2>
      <p>Each workflow is designed around four patient-friendly sections: Summary, Key Findings, What This Means, and Next Steps.</p>
    </div>

    <div class="modules-grid">
      <a routerLink="/xray" class="glass-card module-card">
        <div class="icon-wrapper bg-primary">XR</div>
        <h3>X-Ray Analysis</h3>
        <p>Upload a genuine medical X-ray image and get a cautious simple-language explanation of possible observations and follow-up guidance.</p>
      </a>

      <a routerLink="/pdf" class="glass-card module-card">
        <div class="icon-wrapper bg-secondary">PDF</div>
        <h3>PDF Report Analyzer</h3>
        <p>Upload a medical report PDF or paste report text. The system checks that it is really a clinical document before explaining it.</p>
      </a>

      <a routerLink="/blood" class="glass-card module-card">
        <div class="icon-wrapper bg-warning">LAB</div>
        <h3>Blood Report Analyzer</h3>
        <p>Upload a blood report or enter recognized test values like Hemoglobin, WBC, RBC, and Platelets to spot abnormal markers.</p>
      </a>
    </div>
  `,
  styles: [`
    .hero {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      align-items: stretch;
      margin: 2rem 0 3rem;
    }
    .hero-copy h1 {
      font-size: var(--text-hero);
      font-weight: var(--weight-extrabold);
      line-height: var(--leading-tight);
      margin-bottom: 1rem;
      max-width: 13ch;
      letter-spacing: var(--tracking-tight);
      background: linear-gradient(135deg, #0f172a 0%, #0284c7 55%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: var(--tracking-eyebrow);
      font-size: var(--text-xs);
      color: var(--accent);
      margin-bottom: 1rem;
      font-weight: var(--weight-bold);
    }
    .hero-panel {
      display: grid;
      gap: 1rem;
      align-content: center;
      background: linear-gradient(160deg, rgba(224, 242, 254, 0.8), rgba(220, 252, 231, 0.5));
    }
    .metric {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(2, 132, 199, 0.1);
    }
    .metric:last-child { border-bottom: 0; }
    .metric span {
      display: block;
      color: var(--text-muted);
      font-size: var(--text-sm);
      margin-bottom: 0.3rem;
    }
    .metric strong { font-size: var(--text-md); }
    .dashboard-header { margin-bottom: 2rem; }
    .dashboard-header h2,
    .brand-header h2 {
      font-size: var(--text-3xl);
      line-height: var(--leading-snug);
      margin-bottom: 0.5rem;
    }
    .dashboard-header p,
    .brand-header p {
      color: var(--text-muted);
      max-width: 55rem;
      line-height: var(--leading-relaxed);
    }
    .modules-grid,
    .brand-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .module-card {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-top: 3px solid var(--primary);

      &:has(.bg-secondary) { border-top-color: var(--secondary); }
      &:has(.bg-warning)   { border-top-color: var(--accent); }

      .icon-wrapper {
        font-size: var(--text-sm);
        letter-spacing: var(--tracking-normal);
        font-weight: var(--weight-bold);
        background: rgba(2, 132, 199, 0.1);
        color: var(--primary);
        border: 1.5px solid rgba(2, 132, 199, 0.18);
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-card);
        margin-bottom: 1.5rem;
      }
      h3 { font-size: var(--text-2xl); margin-bottom: 1rem; }
      p { color: var(--text-muted); line-height: var(--leading-relaxed); }
    }
    .bg-secondary {
      background: rgba(5, 150, 105, 0.1) !important;
      color: var(--secondary) !important;
      border-color: rgba(5, 150, 105, 0.18) !important;
    }
    .bg-warning {
      background: rgba(217, 119, 6, 0.1) !important;
      color: var(--accent) !important;
      border-color: rgba(217, 119, 6, 0.18) !important;
    }
    .brand-system { margin-top: 3rem; }
    .brand-header { margin-bottom: 1.5rem; }
    .brand-card {
      display: grid;
      gap: 1rem;
      align-content: start;
    }
    .brand-logo-preview {
      min-height: 84px;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
      border: 1px solid rgba(2, 132, 199, 0.1);
      border-radius: var(--radius-card);
      background: #f8fbff;
    }
    .brand-symbol {
      width: 46px;
      height: 46px;
      border-radius: var(--radius-card);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: #ffffff;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      font-size: var(--text-sm);
      font-weight: var(--weight-extrabold);
      letter-spacing: var(--tracking-normal);
    }
    .brand-wordmark {
      color: var(--text-main);
      font-weight: var(--weight-bold);
      font-size: var(--text-lg);
      line-height: var(--leading-snug);
    }
    .brand-card h3 {
      font-size: var(--text-xl);
      line-height: var(--leading-snug);
    }
    .brand-card p {
      color: var(--text-muted);
      line-height: var(--leading-relaxed);
    }
    .style-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .style-list span {
      padding: 0.4rem 0.65rem;
      border-radius: var(--radius-pill);
      background: rgba(2, 132, 199, 0.07);
      color: var(--text-soft);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
    }
    .brand-logo-vitallens .brand-symbol { background: linear-gradient(135deg, #0284c7, #0f766e); }
    .brand-logo-reportluma .brand-symbol { background: linear-gradient(135deg, #0369a1, #d97706); }
    .brand-logo-carenexa .brand-symbol { background: linear-gradient(135deg, #059669, #0f172a); }
    .brand-logo-medsage .brand-symbol { background: linear-gradient(135deg, #0f172a, #0284c7); }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; }
      .hero-copy h1 { max-width: 16ch; }
    }
    @media (max-width: 520px) {
      .modules-grid,
      .brand-grid { grid-template-columns: 1fr; }
      .brand-logo-preview { align-items: flex-start; }
    }
  `]
})
export class DashboardComponent {
  
}
