import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pdf-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pdf-container">
      <h1 class="page-title">Medical Report Analyzer</h1>
      <p class="page-subtitle">Upload a real medical PDF or paste clinical report text. The system first checks that the content looks like a genuine medical report, then explains it in simple everyday language.</p>

      <div class="mode-switch">
        <button type="button" class="mode-btn" [class.active]="mode === 'upload'" (click)="mode = 'upload'">Upload PDF File</button>
        <button type="button" class="mode-btn" [class.active]="mode === 'text'" (click)="mode = 'text'">Paste Report Text</button>
      </div>

      <!-- Upload Mode -->
      <div class="glass-card" *ngIf="mode === 'upload'; else textMode">
        <p class="form-intro">Upload a medical report as a PDF file. This works best with radiology reports, discharge summaries, clinic notes, and lab result PDFs that contain readable text.</p>

        <button type="button" class="upload-box" [class.has-file]="!!file" (click)="openFilePicker(fileInput)">
          <i>PDF</i>
          <h3>{{ file ? file.name : 'Click here to select your PDF report' }}</h3>
          <p *ngIf="!file">Accepted format: PDF files only</p>
          <p *ngIf="file" class="file-ready">File selected — click the button below to analyze</p>
        </button>
        <input type="file" #fileInput class="file-input" accept="application/pdf" (change)="onFileSelect($event)">

        <div class="info-note">For the best results, use a PDF where you can highlight and copy text. Non-medical PDFs, invoices, articles, or scanned image-only files may be rejected or give limited results.</div>

        <div *ngIf="loading" class="loading-spinner"></div>

        <div class="actions mt-2" *ngIf="!loading">
          <button class="btn-primary" [disabled]="!file" (click)="analyze()">Analyze This Report</button>
        </div>
        <div *ngIf="error" class="error-msg mt-2">{{ error }}</div>
      </div>

      <!-- Text Paste Mode -->
      <ng-template #textMode>
        <div class="glass-card">
          <p class="form-intro">Copy and paste text from a medical report such as a radiology report, discharge summary, or specialist letter. The system will first verify that the text looks clinical before explaining it.</p>

          <div class="form-group">
            <label for="reportName">Report Name (optional)</label>
            <input id="reportName" type="text" [(ngModel)]="reportName" placeholder="e.g. Chest X-ray report, Blood test results">
          </div>

          <div class="form-group">
            <label for="reportText">Paste Your Medical Report Text Here</label>
            <textarea
              id="reportText"
              rows="12"
              [(ngModel)]="reportText"
              placeholder="Paste your report text here...&#10;&#10;Example:&#10;FINDINGS: The lungs are clear. No pleural effusion or pneumothorax.&#10;IMPRESSION: No acute cardiopulmonary abnormality."
            ></textarea>
          </div>

          <div class="text-toolbar">
            <button type="button" class="btn-outline" (click)="loadSampleText()">Load Example Report</button>
            <span class="char-count">{{ reportText.trim().length }} characters entered</span>
          </div>

          <div *ngIf="loading" class="loading-spinner"></div>

          <div class="actions mt-2" *ngIf="!loading">
            <button class="btn-primary" [disabled]="reportText.trim().length < 20" (click)="analyzeText()">Analyze This Text</button>
          </div>
          <div *ngIf="error" class="error-msg mt-2">{{ error }}</div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .pdf-container { max-width: 800px; margin: 0 auto; }

    textarea {
      width: 100%;
      padding: 0.9rem 1rem;
      border-radius: var(--radius-control);
      background: #f4f8ff;
      border: 1.5px solid rgba(2, 132, 199, 0.18);
      color: var(--text-main);
      font-family: inherit;
      line-height: 1.65;
      resize: vertical;
      min-height: 240px;
      font-size: var(--text-sm);
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

    .text-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: 0.75rem;
    }
    .char-count {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

  `]
})
export class PdfReportComponent {
  file: File | null = null;
  loading = false;
  error = '';
  mode: 'upload' | 'text' = 'upload';
  reportName = 'pasted-medical-report.txt';
  reportText = '';

  private api = inject(ApiService);
  private router = inject(Router);

  openFilePicker(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      this.error = 'Only PDF files are accepted for upload. Use the "Paste Text" tab to submit text content.';
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

  analyze() {
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

    this.api.analyzePdf(this.file).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/result']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Could not analyze the PDF. Please check that it is a valid PDF file with readable text, and that the backend server is running.';
        console.error(err);
      }
    });
  }

  analyzeText() {
    const trimmed = this.reportText.trim();
    if (trimmed.length < 20) return;

    const cached = this.api.getCached(this.api.textKey(trimmed));
    if (cached) {
      this.api.currentResult.set(cached);
      this.router.navigate(['/result']);
      return;
    }

    this.api.clearResult();
    this.loading = true;
    this.error = '';
    this.file = null;

    this.api.analyzeReportText({
      report_name: this.reportName.trim() || 'pasted-medical-report.txt',
      report_text: trimmed
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/result']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Could not analyze the report text. Please make sure the backend server is running.';
        console.error(err);
      }
    });
  }

  loadSampleText() {
    this.reportName = 'sample-chest-xray-report.txt';
    this.reportText = `EXAM: Chest X-ray, PA and Lateral views

CLINICAL HISTORY: Cough and shortness of breath for 3 days.

FINDINGS:
Mild patchy opacity is seen in the right lower lung. No pleural effusion or pneumothorax. Cardiomediastinal silhouette is within normal size limits. The bones appear intact with no obvious fracture.

IMPRESSION:
Small right lower lung airspace opacity may represent mild infection or early pneumonia. Follow-up clinical correlation is advised. If symptoms persist, a repeat chest X-ray or further imaging may be recommended.`;
  }
}
