import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, BloodValuesPayload } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blood-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blood-container">
      <h1 class="page-title">Blood Test Report</h1>
      <p class="page-subtitle">Enter recognized blood test values or upload a blood report. The system checks that the content looks like a real blood report before explaining any abnormal values in simple language.</p>

      <div class="mode-switch">
        <button type="button" class="mode-btn" [class.active]="mode === 'manual'" (click)="mode = 'manual'">Enter Values Manually</button>
        <button type="button" class="mode-btn" [class.active]="mode === 'upload'" (click)="mode = 'upload'">Upload Lab Report</button>
      </div>

      <!-- Manual Entry Mode -->
      <div class="glass-card" *ngIf="mode === 'manual'; else uploadMode">
        <p class="form-intro">Enter the values from your blood test report. Use recognized markers like Hemoglobin, WBC, RBC, Platelets, Glucose, or Hematocrit. The system will only check the values you provide.</p>

        <div class="manual-grid">

          <div class="form-group">
            <label for="hemoglobin">
              Hemoglobin (Hb)
              <span class="field-desc">Carries oxygen through your blood</span>
            </label>
            <input id="hemoglobin" type="number" step="0.1" min="0" [(ngModel)]="manualValues.hemoglobin" placeholder="e.g. 14.5">
            <span class="ref-range">Normal: 13–17 g/dL (men) | 12–15 g/dL (women)</span>
          </div>

          <div class="form-group">
            <label for="wbc">
              White Blood Cells (WBC)
              <span class="field-desc">Your body's infection-fighting cells</span>
            </label>
            <input id="wbc" type="number" step="100" min="0" [(ngModel)]="manualValues.wbc" placeholder="e.g. 7500">
            <span class="ref-range">Normal: 4,000–11,000 cells per µL</span>
          </div>

          <div class="form-group">
            <label for="platelets">
              Platelets (PLT)
              <span class="field-desc">Helps your blood clot when you bleed</span>
            </label>
            <input id="platelets" type="number" step="1000" min="0" [(ngModel)]="manualValues.platelets" placeholder="e.g. 250000">
            <span class="ref-range">Normal: 150,000–450,000 per µL</span>
          </div>

          <div class="form-group">
            <label for="glucose">
              Blood Sugar (Glucose)
              <span class="field-desc">The level of sugar (energy) in your blood</span>
            </label>
            <input id="glucose" type="number" step="1" min="0" [(ngModel)]="manualValues.glucose" placeholder="e.g. 95">
            <span class="ref-range">Normal fasting: 70–100 mg/dL | After eating: up to 140 mg/dL</span>
          </div>

          <div class="form-group">
            <label for="rbc">
              Red Blood Cells (RBC)
              <span class="field-desc">The cells that carry oxygen to your organs</span>
            </label>
            <input id="rbc" type="number" step="0.1" min="0" [(ngModel)]="manualValues.rbc" placeholder="e.g. 5.0">
            <span class="ref-range">Normal: 4.5–5.9 M/µL (men) | 4.0–5.2 M/µL (women)</span>
          </div>

          <div class="form-group">
            <label for="hematocrit">
              Hematocrit (HCT)
              <span class="field-desc">The percentage of red blood cells in your blood</span>
            </label>
            <input id="hematocrit" type="number" step="0.1" min="0" [(ngModel)]="manualValues.hematocrit" placeholder="e.g. 42">
            <span class="ref-range">Normal: 41–53% (men) | 36–46% (women)</span>
          </div>

        </div>

        <div class="info-note">Note: These reference ranges are general guidelines only. Your own lab report may show slightly different ranges depending on the laboratory and your age. Always compare your results with the ranges printed on your lab report, and speak to your doctor for a proper interpretation.</div>

        <div class="quick-actions">
          <button type="button" class="btn-outline" (click)="loadSampleCase('anemia')">Try Sample: Low Iron Pattern</button>
          <button type="button" class="btn-outline" (click)="loadSampleCase('infection')">Try Sample: Infection Pattern</button>
          <button type="button" class="btn-outline" (click)="resetManualValues()">Clear All</button>
        </div>

        <div *ngIf="loading" class="loading-spinner"></div>

        <div class="actions mt-2" *ngIf="!loading">
          <button type="button" class="btn-primary" [disabled]="!hasManualValues() || !!manualValuesError()" (click)="analyzeManualValues()">
            Analyze My Blood Values
          </button>
        </div>
        <div *ngIf="manualValuesError()" class="error-msg mt-2">{{ manualValuesError() }}</div>
        <div *ngIf="error && !manualValuesError()" class="error-msg mt-2">{{ error }}</div>
      </div>

      <!-- Upload Mode -->
      <ng-template #uploadMode>
        <div class="glass-card">
          <p class="form-intro">Upload your blood test report as a PDF, text file, or CSV. The system looks for recognizable blood markers before generating a simple-language explanation.</p>

          <button type="button" class="upload-box" [class.has-file]="!!file" (click)="openFilePicker(fileInput)">
            <i>LAB</i>
            <h3>{{ file ? file.name : 'Click here to select your lab report' }}</h3>
            <p *ngIf="!file">Accepted formats: PDF, TXT, CSV — and image files when AI vision is available.</p>
            <p *ngIf="file" class="file-ready">File selected — click below to analyze</p>
          </button>
          <input type="file" #fileInput class="file-input" accept="application/pdf,text/plain,text/csv,image/jpeg,image/png,image/webp,image/gif,image/bmp" (change)="onFileSelect($event)">

          <div class="info-note">For best results, upload a machine-readable PDF or text file that clearly lists markers such as Hemoglobin, WBC, RBC, Platelets, or Glucose. Files without recognizable blood-test parameters may be rejected.</div>

          <div *ngIf="loading" class="loading-spinner"></div>

          <div class="actions mt-2" *ngIf="!loading">
            <button type="button" class="btn-primary" [disabled]="!file" (click)="analyzeUpload()">
              Analyze My Lab Report
            </button>
          </div>
          <div *ngIf="error" class="error-msg mt-2">{{ error }}</div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .blood-container { max-width: 800px; margin: 0 auto; }

    .manual-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.25rem 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        margin-bottom: 0.4rem;
        color: var(--text-main);
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
      }

      .field-desc {
        display: block;
        font-weight: 400;
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-top: 0.15rem;
        margin-bottom: 0.35rem;
      }

      input {
        width: 100%;
        padding: 0.7rem 0.9rem;
        border-radius: var(--radius-control);
        background: #f4f8ff;
        border: 1.5px solid rgba(2, 132, 199, 0.18);
        color: var(--text-main);
        font-family: inherit;
        font-size: var(--text-base);
        transition: border-color 0.25s ease, box-shadow 0.25s ease;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
        }

        &::placeholder {
          color: var(--text-muted);
          opacity: 0.75;
        }
      }

      .ref-range {
        display: block;
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-top: 0.35rem;
        line-height: 1.45;
      }
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

  `]
})
export class BloodReportComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  loading = false;
  error = '';
  file: File | null = null;
  mode: 'manual' | 'upload' = 'manual';
  manualValues: BloodValuesPayload = {
    report_name: 'manual-blood-values',
    hemoglobin: null,
    wbc: null,
    platelets: null,
    glucose: null,
    rbc: null,
    hematocrit: null
  };

  openFilePicker(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (!selected) return;

    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
    ];
    if (!allowedTypes.includes(selected.type)) {
      this.error = 'Only PDF, plain text, CSV, or image files are allowed.';
      input.value = '';
      this.file = null;
      return;
    }

    const maxMB = 20;
    if (selected.size > maxMB * 1024 * 1024) {
      this.error = `File is too large. Maximum allowed size is ${maxMB} MB.`;
      input.value = '';
      this.file = null;
      return;
    }

    this.file = selected;
    this.error = '';
  }

  hasManualValues() {
    return Object.values(this.manualValues).some((value) => typeof value === 'number' && value >= 0);
  }

  manualValuesError(): string {
    const fields: Record<string, { label: string; min: number; max: number }> = {
      hemoglobin:  { label: 'Hemoglobin',  min: 0, max: 25 },
      wbc:         { label: 'WBC',         min: 0, max: 100000 },
      platelets:   { label: 'Platelets',   min: 0, max: 1500000 },
      glucose:     { label: 'Glucose',     min: 0, max: 1000 },
      rbc:         { label: 'RBC',         min: 0, max: 10 },
      hematocrit:  { label: 'Hematocrit',  min: 0, max: 70 },
    };
    for (const [key, cfg] of Object.entries(fields)) {
      const raw = (this.manualValues as Record<string, number | null>)[key];
      if (raw === null || raw === undefined) continue;
      if (raw < cfg.min || raw > cfg.max) {
        return `${cfg.label} value ${raw} is outside the expected range (${cfg.min}–${cfg.max}).`;
      }
    }
    return '';
  }

  analyzeUpload() {
    if (!this.file) return;

    const cached = this.api.getCached(this.api.fileKey(this.file));
    if (cached) {
      this.api.currentResult.set(cached);
      this.router.navigate(['/result']);
      return;
    }

    this.api.clearResult();
    this.loading = true;
    this.error = '';

    this.api.analyzeBloodReport(this.file).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/result']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Could not read the lab report. Please check that the file is a valid PDF or text file, and that the backend server is running.';
        console.error(err);
      }
    });
  }

  analyzeManualValues() {
    if (!this.hasManualValues() || this.manualValuesError()) return;

    const cached = this.api.getCached(this.api.bloodValuesKey(this.manualValues));
    if (cached) {
      this.api.currentResult.set(cached);
      this.router.navigate(['/result']);
      return;
    }

    this.api.clearResult();
    this.loading = true;
    this.error = '';
    this.file = null;

    this.api.analyzeBloodValues(this.manualValues).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/result']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Could not analyze the blood values. Please make sure the backend server is running.';
        console.error(err);
      }
    });
  }

  loadSampleCase(type: 'anemia' | 'infection') {
    this.error = '';
    this.file = null;

    if (type === 'anemia') {
      this.manualValues = {
        report_name: 'sample-low-iron-pattern',
        hemoglobin: 8.6,
        wbc: 7800,
        platelets: 210000,
        glucose: 98,
        rbc: 3.4,
        hematocrit: 29
      };
      return;
    }

    this.manualValues = {
      report_name: 'sample-infection-pattern',
      hemoglobin: 12.8,
      wbc: 15200,
      platelets: 320000,
      glucose: 118,
      rbc: 4.5,
      hematocrit: 39
    };
  }

  resetManualValues() {
    this.error = '';
    this.file = null;
    this.manualValues = {
      report_name: 'manual-blood-values',
      hemoglobin: null,
      wbc: null,
      platelets: null,
      glucose: null,
      rbc: null,
      hematocrit: null
    };
  }
}
