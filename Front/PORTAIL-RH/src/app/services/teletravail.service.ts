import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../shared/services/auth.service';

export interface TeletravailPlanningDTO {
  id?: number;
  politique: 'CHOIX_LIBRE' | 'SEUIL_LIBRE' | 'PLANNING_FIXE' | 'PLANNING_FIXE_JOURS_LIBRES';
  nombreJoursMax?: number;
  mois: string; // Format: "2025-05"
  joursFixes: string[];
  rhId: number;
}

export interface UserTeletravailDTO {
  id?: number;
  userId: number;
  planningId: number;
  planning?: TeletravailPlanningDTO;
  joursChoisis: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TeletravailService {
  private apiUrl = 'http://localhost:8080/api/teletravail';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  createPlanning(planning: TeletravailPlanningDTO): Observable<TeletravailPlanningDTO> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      });
      return throwError(() => new Error('Utilisateur non connecté.'));
    }

    const role = this.authService.getUserRole();
    if (!role || role !== 'RH') {
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Seul un RH peut créer un planning.'
      });
      return throwError(() => new Error('Seul un RH peut créer un planning.'));
    }

    planning.rhId = userId;
    return this.http.post<TeletravailPlanningDTO>(`${this.apiUrl}/plannings`, planning, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors de la création du planning.'
        });
        return throwError(() => new Error(error.message || 'Erreur lors de la création du planning.'));
      })
    );
  }

  selectDays(userTeletravail: UserTeletravailDTO): Observable<UserTeletravailDTO> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      });
      return throwError(() => new Error('Utilisateur non connecté.'));
    }

    const role = this.authService.getUserRole();
    if (!role || !['COLLAB', 'MANAGER'].includes(role)) {
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Seul un COLLAB ou MANAGER peut sélectionner des jours.'
      });
      return throwError(() => new Error('Seul un COLLAB ou MANAGER peut sélectionner des jours.'));
    }

    userTeletravail.userId = userId;
    return this.http.post<UserTeletravailDTO>(`${this.apiUrl}/user/select-days`, userTeletravail, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors de la sélection des jours.'
        });
        return throwError(() => new Error(error.message || 'Erreur lors de la sélection des jours.'));
      })
    );
  }

  getPlanningsForMonth(mois: string): Observable<TeletravailPlanningDTO[]> {
    const rhId = this.authService.getUserIdFromToken();
    if (!rhId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      });
      return throwError(() => new Error('Utilisateur non connecté.'));
    }
  
    const role = this.authService.getUserRole();
    if (!role || role !== 'RH') {
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Seul un RH peut consulter les plannings.'
      });
      return throwError(() => new Error('Seul un RH peut consulter les plannings.'));
    }
  
    return this.http.get<TeletravailPlanningDTO[]>(`${this.apiUrl}/plannings/month/direct`, {
      headers: this.getHeaders(),
      params: { rhId: rhId.toString(), mois }
    }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors de la récupération des plannings.'
        });
        return throwError(() => new Error(error.message || 'Erreur lors de la récupération des plannings.'));
      })
    );
  }

  getUserPlannings(userId: number): Observable<UserTeletravailDTO[]> {
    const currentUserId = this.authService.getUserIdFromToken();
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun jeton d\'authentification trouvé. Veuillez vous reconnecter.'
      }).then(() => {
        this.authService.logout();
        window.location.href = '/login';
      });
      return throwError(() => new Error('Aucun jeton d\'authentification trouvé.'));
    }

    if (!currentUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      }).then(() => {
        this.authService.logout();
        window.location.href = '/login';
      });
      return throwError(() => new Error('Utilisateur non connecté.'));
    }

    return this.http.get<UserTeletravailDTO[]>(`${this.apiUrl}/plannings/user`, {
      headers: this.getHeaders(),
      params: { userId: userId.toString() }
    }).pipe(
      catchError((error) => {
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session expirée',
            text: 'Votre session a expirée. Veuillez vous reconnecter.'
          }).then(() => {
            this.authService.logout();
            window.location.href = '/login';
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error.message || 'Erreur lors de la récupération des plannings de l\'utilisateur.'
          });
        }
        return throwError(() => new Error(error.message || 'Erreur lors de la récupération des plannings de l\'utilisateur.'));
      })
    );
  }
}