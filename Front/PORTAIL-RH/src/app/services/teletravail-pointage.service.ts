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
  pointageDate: string; // Format: YYYY-MM-DD
  pointageTime: string; // Format: HH:MM:SS
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

  // Récupérer le QR code pour un utilisateur
  getQRCode(userId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/qrcode?userId=${userId}`, { responseType: 'text', headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Confirmer un pointage via un token
  confirmPointage(token: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/confirm?token=${token}`, { responseType: 'text', headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les pointages pour une période
  getPointages(startDate: string, endDate: string): Observable<TeletravailPointage[]> {
    return this.http.get<TeletravailPointage[]>(`${this.apiUrl}?startDate=${startDate}&endDate=${endDate}`, { headers: this.getHeaders() }).pipe(
      map(pointages => pointages.map(p => ({
        ...p,
        pointageDate: p.pointageDate.split('T')[0], // Normaliser le format date
        pointageTime: p.pointageTime.substring(0, 8) // HH:MM:SS
      }))),
      catchError(this.handleError)
    );
  }

  // Demander l'envoi de l'email de pointage
  sendPointageEmail(userId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/send-email?userId=${userId}`, {}, { responseType: 'text', headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code : ${error.status}, Message : ${error.error || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}