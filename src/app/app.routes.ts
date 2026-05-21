import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'xray', loadComponent: () => import('./features/xray/xray.component').then(m => m.XrayComponent) },
  { path: 'pdf', loadComponent: () => import('./features/pdf-report/pdf-report.component').then(m => m.PdfReportComponent) },
  { path: 'blood', loadComponent: () => import('./features/blood-report/blood-report.component').then(m => m.BloodReportComponent) },
  { path: 'result', loadComponent: () => import('./features/result/result.component').then(m => m.ResultComponent) },
  { path: 'pricing', loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent) },
  { path: '**', redirectTo: '' }
];
