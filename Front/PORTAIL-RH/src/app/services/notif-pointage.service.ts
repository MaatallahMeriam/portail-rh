import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs'; // Importer 'of'
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../shared/services/auth.service';

export interface PointageNotificationDTO {
  id: number;
  userId: number;
  pointageDate: string;
  isAcknowledged: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotifPointageService {
  private apiUrl = 'http://localhost:8080/api/teletravail/notifications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  checkPendingNotification(date: string): Observable<PointageNotificationDTO | null> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      });
      return throwError(() => new Error('Utilisateur non connecté.'));
    }

    return this.http.get<PointageNotificationDTO>(`${this.apiUrl}/check`, {
      headers: this.getHeaders(),
      params: { userId: userId.toString(), date }
    }).pipe(
      catchError((error) => {
        if (error.status === 204) {
          return of(null)     // Retourner un Observable contenant null
        }
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error?.message || 'Erreur lors de la vérification des notifications.'
        });
        return throwError(() => new Error(error.message || 'Erreur lors de la vérification des notifications.'));
      })
    );
  }

  acknowledgeNotification(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/acknowledge/${notificationId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error?.message || 'Erreur lors de la reconnaissance de la notification.'
        });
        return throwError(() => new Error(error.message || 'Erreur lors de la reconnaissance de la notification.'));
      })
    );
  }
}