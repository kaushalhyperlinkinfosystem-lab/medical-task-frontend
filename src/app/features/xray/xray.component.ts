import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-xray',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="xray-container">
      <h1 class="page-title">X-Ray Analysis</h1>
      <p class="page-subtitle">Upload a real medical X-ray image. The system first checks whether the file looks like an actual X-ray scan, then explains possible observations in simple language.</p>

      <div class="glass-card">
        <button type="button" class="upload-box" [class.has-file]="!!file" (click)="openFilePicker(fileInput)">
          <i>X-RAY</i>
          <h3>{{ file ? file.name : 'Click here to select your X-ray image' }}</h3>
          <p *ngIf="!file">Accepted formats: JPEG, PNG, WEBP</p>
          <p *ngIf="file" class="file-ready">Image selected — click the button below to analyze</p>
        </button>
        <input type="file" #fileInput class="file-input" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff" (change)="onFileSelect($event)">

        <div class="info-grid mt-2">
          <div class="info-item">
            <span class="info-label">What this tool does</span>
            <p>Checks whether the upload looks like a genuine medical X-ray and, if valid, highlights possible visible patterns in simple words.</p>
          </div>
          <div class="info-item">
            <span class="info-label">What this tool does NOT do</span>
            <p>It does not provide a medical diagnosis. Always have your X-ray reviewed by a qualified radiologist or doctor.</p>
          </div>
          <div class="info-item">
            <span class="info-label">Best results</span>
            <p>Upload a clear scan or photo of a medical X-ray film. Chest X-rays, bone X-rays, and similar standard views work best.</p>
          </div>
        </div>

        <div *ngIf="loading" class="loading-spinner"></div>

        <div class="actions mt-2" *ngIf="!loading">
          <button class="btn-primary" [disabled]="!file" (click)="analyze()">Analyze X-Ray Image</button>
        </div>
        <div *ngIf="error" class="error-msg mt-2">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .xray-container { max-width: 800px; margin: 0 auto; }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .info-item {
      padding: 1rem;
      background: #f4f9ff;
      border-radius: 12px;
      border: 1px solid rgba(2, 132, 199, 0.1);
    }
    .info-label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wider);
      color: var(--accent);
      margin-bottom: 0.5rem;
    }
    .info-item p {
      font-size: var(--text-sm);
      color: var(--text-muted);
      line-height: var(--leading-relaxed);
    }

  `]
})
export class XrayComponent {
  file: File | null = null;
  loading = false;
  error = '';

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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(selected.type)) {
      this.error = 'Only image files are allowed (JPEG, PNG, WEBP, GIF, BMP, TIFF).';
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

    const reader = new FileReader();
    reader.onload = () => {
      this.api.currentImage.set(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(this.file);

    const cached = this.api.getCached(this.api.fileKey(this.file));
    if (cached) {
      this.api.currentResult.set(cached);
      this.router.navigate(['/result']);
      return;
    }

    this.api.clearResult();
    this.loading = true;
    this.error = '';

    this.api.analyzeXray(this.file).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/result']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Could not analyze the X-ray image. Please make sure the backend server is running and try again.';
        console.error(err);
      }
    });
  }
}
