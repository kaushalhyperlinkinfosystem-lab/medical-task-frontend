import { Component, inject } from '@angular/core';
import { AnalysisResponse, ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResponseTextPipe } from '../../shared/response-text.pipe';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterLink, ResponseTextPipe],
  template: `
    <div class="result-container" *ngIf="api.currentResult() as result; else noResult">
      <ng-container *ngIf="result.patient_report_summary as ps">

        <!-- Page Header -->
        <div class="result-header">
          <div>
            <p class="eyebrow">{{ moduleLabel(result.module) }}</p>
            <h1 class="page-title">Your Medical Report Summary</h1>
            <p class="page-subtitle">{{ result.file_name }}</p>
          </div>
          <div class="header-actions">
            <button type="button" class="btn-outline" [class.copied]="copied" (click)="copyPatientSummary(result)">
              {{ copied ? 'Copied!' : 'Copy Summary' }}
            </button>
            <button type="button" class="btn-outline" (click)="downloadPatientSummary(result)">Download Summary</button>
            <a routerLink="/" class="btn-outline" (click)="startNewAnalysis()">New Analysis</a>
          </div>
        </div>

        <!-- Overall Status Banner -->
        <div class="section-block">
          <h2 class="section-heading">Summary</h2>
          <div class="status-banner" [ngClass]="statusClass(ps.is_everything_normal, result.integrity.status)">
            <div class="status-icon-box">
              <span class="status-icon-text">{{ statusIcon(ps.is_everything_normal, result.integrity.status) }}</span>
            </div>
            <div class="status-content">
              <h2 class="status-title">{{ statusTitle(ps.is_everything_normal, result.integrity.status) }}</h2>
              <div class="response-rich is-muted is-compact status-text" [innerHTML]="ps.normal_status_text | responseText"></div>
            </div>
          </div>
          <div class="glass-card mt-2">
            <div class="response-rich explanation-text" [innerHTML]="result.summary | responseText"></div>
          </div>
        </div>

        <!-- X-ray image preview -->
        <div class="glass-card xray-preview" *ngIf="api.currentImage() && result.module === 'xray'">
          <img [src]="api.currentImage()" alt="Your uploaded X-ray image" class="preview-img">
          <p class="preview-caption">Your uploaded X-ray image</p>
        </div>

        <!-- Section 1: Key Findings -->
        <div class="section-block">
          <h2 class="section-heading">Key Findings</h2>
          <div class="grid-2">
            <div class="glass-card">
              <h3 class="card-heading">Main Findings</h3>
              <ul class="finding-list" *ngIf="ps.main_findings.length; else noMainFindings">
                <li *ngFor="let item of ps.main_findings">{{ item }}</li>
              </ul>
              <ng-template #noMainFindings>
                <p class="text-muted">No major findings were highlighted in this report.</p>
              </ng-template>
            </div>
            <div class="glass-card">
              <h3 class="card-heading">In simple Words</h3>
              <div class="response-rich explanation-text" [innerHTML]="ps.simple_explanation | responseText"></div>
            </div>
          </div>
        </div>

        <!-- Section 2: Detailed Findings with severity badges -->
        <div class="section-block" *ngIf="result.key_findings.length">
          <h2 class="section-heading">Detailed Findings</h2>
          <div class="findings-grid">
            <div class="finding-card" [ngClass]="'severity-' + finding.severity" *ngFor="let finding of result.key_findings">
              <div class="finding-header">
                <span class="finding-title">{{ finding.title }}</span>
                <span class="severity-badge" [ngClass]="'badge-' + finding.severity">{{ severityLabel(finding.severity) }}</span>
              </div>
              <div class="response-rich is-muted is-compact finding-detail" [innerHTML]="finding.detail | responseText"></div>
              <div class="response-rich is-soft is-compact finding-evidence" *ngIf="finding.evidence" [innerHTML]="finding.evidence | responseText"></div>
            </div>
          </div>
        </div>

        <!-- Section 3: Problems & Concerns -->
        <div class="glass-card section-block" *ngIf="ps.problems_concerns.length">
          <h3 class="card-heading">Problems &amp; Concerns Identified</h3>
          <p class="card-subtext">The following items were flagged and may need medical attention.</p>
          <ul class="concern-list">
            <li *ngFor="let concern of ps.problems_concerns">{{ concern }}</li>
          </ul>
        </div>

        <!-- Section 4: Key Values & Observations -->
        <div class="section-block" *ngIf="ps.important_values_observations.length">
          <h2 class="section-heading">Key Values &amp; Observations</h2>
          <div class="glass-card">
            <p class="card-subtext">These are the specific numbers or observations recorded in your report.</p>
            <ul class="values-list">
              <li *ngFor="let item of ps.important_values_observations">{{ item }}</li>
            </ul>
          </div>
        </div>

        <!-- Section 5: What This Means -->
        <div class="section-block" *ngIf="result.possible_causes.length || result.effects.length">
          <h2 class="section-heading">What This Means</h2>
          <div class="grid-2">
            <div class="glass-card" *ngIf="result.possible_causes.length">
              <h3 class="card-heading">Possible Causes</h3>
              <p class="card-subtext">These are common reasons why these kinds of results occur. They are not a diagnosis.</p>
              <ul class="info-list">
                <li *ngFor="let cause of result.possible_causes">{{ cause }}</li>
              </ul>
            </div>
            <div class="glass-card" *ngIf="result.effects.length">
              <h3 class="card-heading">How This May Affect You</h3>
              <p class="card-subtext">These are symptoms or physical effects that can be related to the findings.</p>
              <ul class="info-list">
                <li *ngFor="let effect of result.effects">{{ effect }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 6: Next Steps -->
        <div class="section-block">
          <h2 class="section-heading">Next Steps</h2>
          <div class="grid-2">
            <div class="glass-card">
              <h3 class="card-heading">Recommended Steps</h3>
              <ol class="steps-list" *ngIf="ps.suggested_next_steps.length; else noSteps">
                <li *ngFor="let step of ps.suggested_next_steps">{{ step }}</li>
              </ol>
              <ng-template #noSteps>
                <p class="text-muted">No specific next steps were generated for this report.</p>
              </ng-template>
            </div>
            <div class="glass-card" *ngIf="result.general_advice.length">
              <h3 class="card-heading">General Advice</h3>
              <ul class="info-list">
                <li *ngFor="let item of result.general_advice">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 7: Future Health Considerations -->
        <div class="glass-card section-block" *ngIf="result.future_risks.length">
          <h3 class="card-heading">Future Health Considerations</h3>
          <p class="card-subtext">These are things to keep in mind for your long-term health based on these findings.</p>
          <ul class="info-list">
            <li *ngFor="let risk of result.future_risks">{{ risk }}</li>
          </ul>
        </div>

        <!-- Analysis notice (only shows if AI was unavailable) -->
        <div class="glass-card notice-panel section-block" *ngIf="result.error">
          <h3 class="card-heading">Analysis Notice</h3>
          <div class="response-rich is-warning" [innerHTML]="result.error | responseText"></div>
        </div>

        <!-- Technical Details (collapsible) -->
        <details class="tech-details section-block">
          <summary class="tech-summary">Technical Details (for reference only)</summary>
          <div class="tech-content">

            <div class="grid-2">
              <div class="glass-card">
                <h3 class="card-heading">Analysis Summary</h3>
                <div class="response-rich is-muted tech-text" [innerHTML]="result.summary | responseText"></div>
                <span class="meta-label mt-inline">System Explanation</span>
                <div class="response-rich is-muted tech-text" [innerHTML]="result.explanation | responseText"></div>
              </div>
              <div class="glass-card" [ngClass]="result.integrity.status !== 'pass' ? 'warn-card' : ''">
                <h3 class="card-heading">Data Quality Check</h3>
                <p>Status: <strong>{{ integrityLabel(result.integrity.status) }}</strong></p>
                <p>Completeness: {{ result.integrity.completeness_score }}%</p>
              </div>
            </div>

            <div class="glass-card mt-2" *ngIf="hasIntegrityIssues(result)">
              <h3 class="card-heading">Quality Checks</h3>
              <ul class="info-list">
                <li *ngFor="let issue of result.integrity.missing_fields">Missing information: {{ issue }}</li>
                <li *ngFor="let issue of result.integrity.suspicious_values">Unusual value: {{ issue }}</li>
                <li *ngFor="let issue of result.integrity.formatting_issues">Format note: {{ issue }}</li>
                <li *ngFor="let issue of result.integrity.extraction_inconsistencies">Inconsistency: {{ issue }}</li>
                <li *ngFor="let note of result.integrity.notes">Note: {{ note }}</li>
              </ul>
            </div>
            <div class="glass-card mt-2" *ngIf="!hasIntegrityIssues(result)">
              <h3 class="card-heading">Quality Checks</h3>
              <p class="text-muted">No quality concerns were flagged for this report.</p>
            </div>

            <div class="glass-card mt-2" *ngIf="result.confidence_notes.length">
              <h3 class="card-heading">Confidence Notes</h3>
              <ul class="info-list">
                <li *ngFor="let note of result.confidence_notes">
                  <strong>{{ note.area | titlecase }}:</strong> {{ note.note }}
                </li>
              </ul>
            </div>

            <div class="glass-card mt-2" *ngIf="result.extracted_content.raw_text || result.extracted_content.extraction_warnings.length">
              <h3 class="card-heading">Extracted Text</h3>
              <div class="warning-strip" *ngIf="result.extracted_content.extraction_warnings.length">
                {{ result.extracted_content.extraction_warnings.join(' | ') }}
              </div>
              <pre *ngIf="result.extracted_content.raw_text; else noText">{{ result.extracted_content.raw_text }}</pre>
              <ng-template #noText>
                <p class="text-muted">No raw text was extracted from this file.</p>
              </ng-template>
            </div>

          </div>
        </details>

        <!-- Disclaimer -->
        <div class="disclaimer">
          <strong>Important Notice:</strong>
          <div class="response-rich is-soft is-compact disclaimer-copy" [innerHTML]="result.disclaimer | responseText"></div>
        </div>

      </ng-container>
    </div>

    <ng-template #noResult>
      <div class="no-result-card glass-card text-center">
        <div class="no-result-icon">?</div>
        <h2>No Result Found</h2>
        <p class="text-muted">Please run an analysis first to see your report summary here.</p>
        <a routerLink="/" class="btn-primary mt-2" (click)="startNewAnalysis()">Start an Analysis</a>
      </div>
    </ng-template>
  `,
  styles: [`
    /* ── Layout ── */
    .result-container { max-width: 960px; margin: 0 auto; }
    .section-block { margin-top: 1.75rem; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem; }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-muted); line-height: 1.6; overflow-wrap: anywhere; }

    /* ── Page Header ── */
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: flex-end;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: var(--tracking-widest);
      font-size: var(--text-xs);
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    /* ── Status Banner ── */
    .status-banner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem 2rem;
      border-radius: 20px;
      border: 1px solid rgba(5, 150, 105, 0.25);
      background: linear-gradient(135deg, rgba(209, 250, 229, 0.8), rgba(167, 243, 208, 0.4));
    }
    .status-banner.status-warn {
      border-color: rgba(217, 119, 6, 0.3);
      background: linear-gradient(135deg, rgba(255, 237, 213, 0.9), rgba(254, 215, 170, 0.5));
    }
    .status-banner.status-fail {
      border-color: rgba(220, 38, 38, 0.3);
      background: linear-gradient(135deg, rgba(254, 226, 226, 0.9), rgba(252, 165, 165, 0.3));
    }
    .status-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(5, 150, 105, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(5, 150, 105, 0.2);
    }
    .status-warn .status-icon-box {
      background: rgba(217, 119, 6, 0.1);
      border-color: rgba(217, 119, 6, 0.2);
    }
    .status-fail .status-icon-box {
      background: rgba(220, 38, 38, 0.1);
      border-color: rgba(220, 38, 38, 0.2);
    }
    .status-icon-text {
      font-size: var(--text-sm);
      font-weight: var(--weight-extrabold);
      letter-spacing: var(--tracking-wide);
      color: #065f46;
    }
    .status-warn .status-icon-text { color: #92400e; }
    .status-fail .status-icon-text { color: #991b1b; }
    .status-content { flex: 1; }
    .status-title {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      margin-bottom: 0.4rem;
    }
    .status-text { font-size: var(--text-sm); }

    /* ── Section Headings ── */
    .card-heading {
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
      margin-bottom: 0.6rem;
    }
    .card-subtext {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-bottom: 0.9rem;
      line-height: var(--leading-snug);
    }

    /* ── Detailed Findings ── */
    .findings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .finding-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 1.1rem 1.25rem;
      border: 1px solid rgba(2, 132, 199, 0.1);
      border-left: 4px solid rgba(5, 150, 105, 0.5);
      box-shadow: 0 2px 12px rgba(2, 132, 199, 0.06);
    }
    .finding-card.severity-high {
      border-left-color: var(--alert);
      background: rgba(254, 226, 226, 0.5);
      border-color: rgba(220, 38, 38, 0.12);
    }
    .finding-card.severity-moderate {
      border-left-color: #d97706;
      background: rgba(255, 243, 199, 0.6);
      border-color: rgba(217, 119, 6, 0.12);
    }
    .finding-card.severity-low {
      border-left-color: rgba(5, 150, 105, 0.55);
    }
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
    }
    .finding-title {
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      flex: 1;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
    .severity-badge {
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      padding: 0.22rem 0.6rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: var(--tracking-normal);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .badge-high { background: rgba(220, 38, 38, 0.12); color: #991b1b; border: 1px solid rgba(220,38,38,0.2); }
    .badge-moderate { background: rgba(217, 119, 6, 0.1); color: #92400e; border: 1px solid rgba(217,119,6,0.2); }
    .badge-low { background: rgba(5, 150, 105, 0.1); color: #065f46; border: 1px solid rgba(5,150,105,0.2); }
    .finding-detail { font-size: var(--text-sm); margin-bottom: 0.4rem; }
    .finding-evidence { font-size: var(--text-xs); font-style: italic; }

    /* ── Lists ── */
    .finding-list, .concern-list, .values-list, .info-list { padding-left: 1.4rem; }
    .finding-list li, .concern-list li, .values-list li, .info-list li {
      margin-bottom: 0.8rem;
      line-height: 1.6;
    }
    .steps-list { padding-left: 1.6rem; }
    .steps-list li { margin-bottom: 0.8rem; line-height: 1.6; }

    /* ── Explanation ── */
    .explanation-text { line-height: 1.75; font-size: var(--text-base); }

    /* ── X-ray Preview ── */
    .xray-preview { text-align: center; margin-top: 1.5rem; }
    .preview-img { max-width: 100%; max-height: 380px; border-radius: 10px; object-fit: contain; }
    .preview-caption { margin-top: 0.75rem; color: var(--text-muted); font-size: var(--text-sm); }

    /* ── Notice / Warning Panels ── */
    .notice-panel {
      border: 1px solid rgba(217, 119, 6, 0.25) !important;
      background: rgba(255, 243, 199, 0.7) !important;
    }
    .warn-card {
      border-color: rgba(217, 119, 6, 0.25) !important;
      background: rgba(255, 243, 199, 0.5) !important;
    }
    .warning-strip {
      padding: 0.85rem 1rem;
      border-radius: 10px;
      background: rgba(255, 237, 213, 0.9);
      color: #92400e;
      border: 1px solid rgba(217, 119, 6, 0.2);
      margin-bottom: 1rem;
      line-height: 1.55;
      font-size: var(--text-sm);
    }

    /* ── Technical Details (collapsible) ── */
    .tech-details {
      border-radius: 16px;
      border: 1px solid rgba(2, 132, 199, 0.12);
      overflow: hidden;
    }
    .tech-summary {
      padding: 1rem 1.5rem;
      cursor: pointer;
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      color: var(--text-muted);
      background: #f4f9ff;
      user-select: none;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .tech-summary::-webkit-details-marker { display: none; }
    .tech-summary::before {
      content: '+';
      font-weight: var(--weight-bold);
      font-size: var(--text-base);
      width: 1.2rem;
      display: inline-block;
      color: var(--text-muted);
    }
    details[open] .tech-summary::before { content: '-'; }
    .tech-content {
      padding: 1.5rem;
      border-top: 1px solid rgba(2, 132, 199, 0.1);
    }
    .tech-text { line-height: 1.65; font-size: var(--text-sm); }
    .meta-label {
      display: block;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-normal);
      margin-bottom: 0.6rem;
    }
    .mt-inline { margin-top: 1.25rem; }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: var(--text-sm);
      line-height: 1.65;
      color: var(--text-muted);
      background: #f4f8ff;
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid rgba(2, 132, 199, 0.1);
    }

    /* ── Copied button state ── */
    .btn-outline.copied {
      color: var(--secondary);
      border-color: var(--secondary);
    }

    /* ── Disclaimer ── */
    .disclaimer {
      margin-top: 2.5rem;
      padding: 1.1rem 1.4rem;
      background: rgba(254, 226, 226, 0.6);
      border-left: 4px solid var(--alert);
      border-radius: 6px;
      color: #7f1d1d;
      font-size: var(--text-sm);
    }
    .disclaimer strong { display: block; margin-bottom: 0.55rem; color: #991b1b; }
    .disclaimer-copy { color: inherit; }

    /* ── No Result State ── */
    .no-result-card {
      max-width: 520px;
      margin: 5rem auto;
    }
    .no-result-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(2, 132, 199, 0.08);
      border: 2px solid rgba(2, 132, 199, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-4xl);
      font-weight: 700;
      color: var(--primary);
      margin: 0 auto 1.5rem;
    }
    .no-result-card h2 { margin-bottom: 0.75rem; color: var(--text-main); }
    .mt-2 { display: inline-block; }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .result-header { flex-direction: column; }
      .status-banner { flex-direction: column; align-items: flex-start; }
      .grid-2, .findings-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .result-container { max-width: 100%; }
      .status-banner { padding: 1.25rem; }
      .finding-header { flex-direction: column; }
      .header-actions { width: 100%; }
      .header-actions > * { flex: 1 1 100%; text-align: center; }
    }
  `]
})
export class ResultComponent {
  api = inject(ApiService);
  copied = false;

  moduleLabel(module: string): string {
    const labels: Record<string, string> = {
      xray: 'X-Ray Analysis',
      blood: 'Blood Test Results',
      pdf: 'Medical Report Summary',
    };
    return labels[module] ?? 'Medical Report';
  }

  severityLabel(severity: string): string {
    if (severity === 'high') return 'Needs Attention';
    if (severity === 'moderate') return 'Worth Reviewing';
    return 'Minor Note';
  }

  statusClass(isNormal: boolean, integrityStatus: string): string {
    if (integrityStatus === 'fail') return 'status-fail';
    if (integrityStatus === 'review' || !isNormal) return 'status-warn';
    return '';
  }

  statusIcon(isNormal: boolean, integrityStatus: string): string {
    if (integrityStatus === 'fail' || integrityStatus === 'review' || !isNormal) return '!';
    return 'OK';
  }

  statusTitle(isNormal: boolean, integrityStatus: string): string {
    if (integrityStatus === 'fail') return 'Unable to Fully Read This Report';
    if (integrityStatus === 'review' || !isNormal) return 'Some Items Need Medical Review';
    return 'Results Appear Normal';
  }

  integrityLabel(status: string): string {
    if (status === 'pass') return 'Complete & Readable';
    if (status === 'review') return 'Partially Complete';
    return 'Incomplete Data';
  }

  hasIntegrityIssues(result: AnalysisResponse): boolean {
    const i = result.integrity;
    return !!(
      i.missing_fields.length ||
      i.suspicious_values.length ||
      i.formatting_issues.length ||
      i.extraction_inconsistencies.length ||
      i.notes.length
    );
  }

  startNewAnalysis() {
    this.api.clearResult();
  }

  async copyPatientSummary(result: AnalysisResponse | null) {
    if (!result) return;
    const text = this.buildPatientSummaryText(result);
    try {
      await navigator.clipboard.writeText(text);
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2500);
    } catch {
      // Clipboard API unavailable (non-HTTPS context)
    }
  }

  downloadPatientSummary(result: AnalysisResponse | null) {
    if (!result) return;
    const text = this.buildPatientSummaryText(result);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${result.file_name || 'patient-summary'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private buildPatientSummaryText(result: AnalysisResponse): string {
    const ps = result.patient_report_summary;
    const line = '─'.repeat(58);
    const bullet = (items: string[]) => items.map(i => `  • ${i}`).join('\n');

    const parts: string[] = [
      '╔' + '═'.repeat(58) + '╗',
      '║' + '          PATIENT MEDICAL REPORT SUMMARY               ' + '║',
      '╚' + '═'.repeat(58) + '╝',
      '',
      `  Report:   ${result.file_name}`,
      `  Type:     ${this.moduleLabel(result.module)}`,
      `  Status:   ${this.statusTitle(ps.is_everything_normal, result.integrity.status)}`,
      '',
      line,
      'WHAT WE FOUND',
      line,
      ps.main_findings.length ? bullet(ps.main_findings) : '  No major findings were highlighted.',
      '',
      'IN SIMPLE WORDS',
      `  ${ps.simple_explanation}`,
    ];

    if (ps.problems_concerns.length) {
      parts.push('', line, 'PROBLEMS & CONCERNS', line, bullet(ps.problems_concerns));
    }

    if (ps.important_values_observations.length) {
      parts.push('', line, 'KEY VALUES & OBSERVATIONS', line, bullet(ps.important_values_observations));
    }

    parts.push(
      '', line,
      'WHAT YOU SHOULD DO NEXT',
      line,
      ps.suggested_next_steps.length ? bullet(ps.suggested_next_steps) : '  No specific next steps were generated.',
      '', line,
      'IMPORTANT NOTICE',
      line,
      `  ${result.disclaimer}`
    );

    return parts.join('\n');
  }
}
