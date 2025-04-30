import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Kpi {
  id: number;
  nbreDepart: number;
  effectifDebut: number;
  effectifFin: number;
  effectifMoyen: number;
  turnover: number;
  dateCalcul: string; // ISO date string (e.g., "2025-04-30")
}

@Injectable({
  providedIn: 'root',
})
export class KpiService {
  private apiUrl = 'http://localhost:8080/api/kpi'; // Base URL définie dans environment

  constructor(private http: HttpClient) {}

  getLatestKpi(): Observable<Kpi> {
    return this.http.get<Kpi>(`${this.apiUrl}/latest`);
  }
}