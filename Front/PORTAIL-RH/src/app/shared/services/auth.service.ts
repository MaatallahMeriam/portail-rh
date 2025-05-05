import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, fromEvent, merge, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private inactivityTimeout: any;
  private readonly INACTIVITY_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_DURATION = 60 * 1000; // 1 minute warning
  private destroy$ = new Subject<void>();
  private cachedUser: { id: number; nom: string } | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.setupInactivityListener();
  }

  login(credentials: { mail: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.startInactivityTimer();
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  register(registerData: {
    userName: string;
    nom: string;
    prenom: string;
    mail: string;
    password: string;
    dateNaissance: string;
    poste: string;
    departement: string;
    role: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, registerData).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.startInactivityTimer();
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage'); // Debug
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload); // Debug
      return payload.role || null;
    } catch (e) {
      console.error('Erreur lors du décodage du token', e);
      return null;
    }
  }

  getUserNameFromToken(): string | null {
    if (this.cachedUser) {
      console.log('Returning cached user name:', this.cachedUser.nom); // Debug
      return this.cachedUser.nom;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage'); // Debug
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload); // Debug
      this.cachedUser = { id: payload.id, nom: payload.nom || payload.prenom + ' ' + payload.nom || 'Unknown' };
      return this.cachedUser.nom || null;
    } catch (e) {
      console.error('Erreur lors du décodage du token', e);
      return null;
    }
  }

  getUserIdFromToken(): number | null {
    if (this.cachedUser) {
      return this.cachedUser.id;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage'); // Debug
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload); // Debug
      this.cachedUser = { id: payload.id, nom: payload.nom || 'Unknown' };
      return payload.id || null;
    } catch (e) {
      console.error('Erreur lors du décodage du token', e);
      return null;
    }
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!localStorage.getItem('token');
    console.log('isLoggedIn:', isLoggedIn); // Debug
    return isLoggedIn;
  }

  logout(): void {
    console.log('Logging out'); // Debug
    this.cachedUser = null;
    localStorage.removeItem('token');
    this.stopInactivityTimer();
    this.router.navigate(['/login']);
  }

  private setupInactivityListener(): void {
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll')
    );

    activityEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isLoggedIn()) {
          this.resetInactivityTimer();
        }
      });
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();
    this.inactivityTimeout = setTimeout(() => {
      if (this.isLoggedIn()) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expiring Soon',
          text: 'You will be logged out in 1 minute due to inactivity. Do you want to stay logged in?',
          showCancelButton: true,
          confirmButtonText: 'Stay Logged In',
          cancelButtonText: 'Log Out Now',
          timer: this.WARNING_DURATION,
          timerProgressBar: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.resetInactivityTimer();
          } else {
            this.logout();
          }
        });
      }
    }, this.INACTIVITY_DURATION - this.WARNING_DURATION);
  }

  private resetInactivityTimer(): void {
    this.startInactivityTimer();
  }

  private stopInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopInactivityTimer();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    if (error.status === 401) {
      errorMessage = 'Email ou mot de passe incorrect.';
    } else if (error.status === 400) {
      errorMessage = error.error || 'Erreur dans les données fournies.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur : ${error.status} - ${error.message}`;
    }
    console.error('Error:', errorMessage); // Debug
    return throwError(() => new Error(errorMessage));
  }
}