import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface ExtractedSection {
  title: string;
  content: string;
}

export interface ExtractedContent {
  raw_text: string;
  sections: ExtractedSection[];
  metadata: Record<string, string | number | boolean>;
  extraction_warnings: string[];
}

export interface KeyFinding {
  title: string;
  detail: string;
  severity: string;
  evidence?: string | null;
}

export interface IntegrityResult {
  status: string;
  completeness_score: number;
  missing_fields: string[];
  suspicious_values: string[];
  formatting_issues: string[];
  extraction_inconsistencies: string[];
  notes: string[];
}

export interface ConfidenceNote {
  area: string;
  level: string;
  note: string;
}

export interface LlmExecution {
  provider: string;
  primary_model: string;
  mode: string;
  live_model_used: boolean;
  fallback_model?: string | null;
}

export interface PatientReportSummary {
  main_findings: string[];
  is_everything_normal: boolean;
  normal_status_text: string;
  problems_concerns: string[];
  important_values_observations: string[];
  simple_explanation: string;
  suggested_next_steps: string[];
}

export interface AnalysisResponse {
  success: boolean;
  module: string;
  file_name: string;
  file_type: string;
  extracted_content: ExtractedContent;
  summary: string;
  key_findings: KeyFinding[];
  integrity: IntegrityResult;
  recommendations: string[];
  confidence_notes: ConfidenceNote[];
  llm: LlmExecution;
  detected_issues: string[];
  explanation: string;
  possible_causes: string[];
  effects: string[];
  future_risks: string[];
  general_advice: string[];
  patient_report_summary: PatientReportSummary;
  error?: string | null;
  language: string;
  disclaimer: string;
}

export interface HealthResponse {
  status: string;
  project: string;
  version: string;
  llm_configured: boolean;
  llm_provider: string;
  local_xray_model_configured: boolean;
}

export interface CapabilityModule {
  id: string;
  name: string;
  inputs: string[];
  outputs: string[];
}

export interface CapabilitiesResponse {
  project: string;
  version: string;
  modules: CapabilityModule[];
  patient_notice: string;
}

export interface BloodValuesPayload {
  patient_id?: string;
  report_name?: string;
  hemoglobin?: number | null;
  wbc?: number | null;
  platelets?: number | null;
  glucose?: number | null;
  rbc?: number | null;
  hematocrit?: number | null;
}

export interface ReportTextPayload {
  report_text: string;
  report_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = this.resolveApiUrl();
  private readonly CACHE_PREFIX = 'mediAI_v1_';
  private readonly MAX_CACHE_ITEMS = 15;

  public currentResult = signal<AnalysisResponse | null>(null);
  public currentImage  = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // ── Cache helpers ────────────────────────────────────────────────────────────

  fileKey(file: File): string {
    return `file__${file.name}__${file.size}__${file.lastModified}`;
  }

  textKey(text: string): string {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    }
    return `text__${h >>> 0}`;
  }

  bloodValuesKey(data: BloodValuesPayload): string {
    const vals = [data.hemoglobin, data.wbc, data.platelets, data.glucose, data.rbc, data.hematocrit];
    return `blood__${vals.join('_')}`;
  }

  getCached(key: string): AnalysisResponse | null {
    try {
      const raw = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!raw) return null;
      return (JSON.parse(raw) as { result: AnalysisResponse }).result;
    } catch {
      return null;
    }
  }

  setCache(key: string, result: AnalysisResponse): void {
    try {
      const storageKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(this.CACHE_PREFIX)) storageKeys.push(k);
      }
      if (storageKeys.length >= this.MAX_CACHE_ITEMS) {
        localStorage.removeItem(storageKeys[0]);
      }
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify({ result, ts: Date.now() }));
    } catch {
      // Ignore storage quota errors
    }
  }

  // ── API methods ──────────────────────────────────────────────────────────────

  analyzeXray(file: File): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'en');
    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyze/xray`, formData).pipe(
      tap(res => {
        this.currentResult.set(res);
        this.setCache(this.fileKey(file), res);
      })
    );
  }

  analyzePdf(file: File): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'en');
    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyze/pdf`, formData).pipe(
      tap(res => {
        this.currentResult.set(res);
        this.setCache(this.fileKey(file), res);
      })
    );
  }

  analyzeBloodReport(file: File): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'en');
    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyze/blood-report`, formData).pipe(
      tap(res => {
        this.currentResult.set(res);
        this.setCache(this.fileKey(file), res);
      })
    );
  }

  analyzeBloodValues(data: BloodValuesPayload): Observable<AnalysisResponse> {
    return this.http.post<AnalysisResponse>(
      `${this.apiUrl}/analyze/blood-values`,
      { ...data, language: 'en' }
    ).pipe(tap(res => {
      this.currentResult.set(res);
      this.setCache(this.bloodValuesKey(data), res);
    }));
  }

  analyzeReportText(data: ReportTextPayload): Observable<AnalysisResponse> {
    return this.http.post<AnalysisResponse>(
      `${this.apiUrl}/analyze/report-text`,
      { ...data, language: 'en' }
    ).pipe(tap(res => {
      this.currentResult.set(res);
      this.setCache(this.textKey(data.report_text), res);
    }));
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.apiUrl}/health`);
  }

  getCapabilities(): Observable<CapabilitiesResponse> {
    return this.http.get<CapabilitiesResponse>(`${this.apiUrl}/capabilities`);
  }

  clearResult(): void {
    this.currentResult.set(null);
    this.currentImage.set(null);
  }

  private resolveApiUrl(): string {
    return 'https://medical-task-backend.onrender.com';
  }
}
