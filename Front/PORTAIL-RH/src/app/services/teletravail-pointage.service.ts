import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../src/environments/environment';
import { AuthService } from '../shared/services/auth.service';

export interface TeletravailPointage {
  id: number;
  userId: number;
  userTeletravailId: number;
  pointageDate: string;
  pointageTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeletravailPointageService {
  private apiUrl = `${environment.apiUrl}/api/teletravail/pointage`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getQRCode(userId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/qrcode?userId=${userId}`, { responseType: 'text', headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  confirmPointage(token: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/confirm?token=${token}`, { responseType: 'text', headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getPointages(startDate: string, endDate: string, userId: number): Observable<TeletravailPointage[]> {
  const url = `${this.apiUrl}?startDate=${startDate}&endDate=${endDate}&userId=${userId}`;
  console.log('Requête envoyée:', url); // Log pour débogage
  return this.http.get<TeletravailPointage[]>(url, { headers: this.getHeaders() }).pipe(
    map(pointages => pointages.map(p => {
      const date = p.pointageDate ? p.pointageDate : '';
      const time = p.pointageTime ? p.pointageTime.substring(0, 8) : '';
      return {
        ...p,
        pointageDate: date,
        pointageTime: time
      };
    })),
    catchError(this.handleError)
  );
}

  sendPointageEmail(userId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/send-email?userId=${userId}`, {}, { responseType: 'text', headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      errorMessage = `Code : ${error.status}, Message : ${error.error?.message || error.message}`;
    }
    console.error('Erreur HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }
}