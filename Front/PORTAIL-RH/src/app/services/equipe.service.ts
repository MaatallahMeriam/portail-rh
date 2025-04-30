import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { UserDTO } from './users.service';

export interface EquipeDTO {
  id: number;
  nom: string;
  departement: string;
  managerId: number | null;
}

export interface CreateEquipeRequest {
  nom: string;
  departement: string;
  managerId: number;
}

export interface UpdateEquipeRequest {
  nom: string;
  departement: string;
}

export interface TeamMemberDTO {
  id: number;
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
  image: string;
  mail: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAllEquipes(): Observable<EquipeDTO[]> {
    return this.http.get<EquipeDTO[]>(`${this.apiUrl}/equipes`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des équipes.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  createEquipe(equipe: CreateEquipeRequest): Observable<EquipeDTO> {
    return this.http.post<EquipeDTO>(`${this.apiUrl}/equipes`, equipe).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error || 'Une équipe avec ce nom existe déjà.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de la création de l\'équipe.',
          });
        }
        return throwError(() => new Error(error.message));
      })
    );
  }

  getManagerByEquipeId(equipeId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/equipes/${equipeId}/manager`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement du manager.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getUsersByEquipeId(equipeId: number): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/equipes/${equipeId}/users`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getUsersByEquipeIdExcludingManager(equipeId: number): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/equipes/${equipeId}/users/exclude-manager`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des membres de l\'équipe sans le manager.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  deleteEquipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/equipes/${id}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  updateEquipe(id: number, equipe: UpdateEquipeRequest): Observable<EquipeDTO> {
    return this.http.put<EquipeDTO>(`${this.apiUrl}/equipes/${id}`, equipe).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error || 'Une équipe avec ce nom existe déjà.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de la mise à jour de l\'équipe.',
          });
        }
        return throwError(() => new Error(error.message));
      })
    );
  }

  assignUserToEquipe(equipeId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/equipes/${equipeId}/users/${userId}`, {}).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'assignation de l\'utilisateur à l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  removeUserFromEquipe(equipeId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/equipes/${equipeId}/users/${userId}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du retrait de l\'utilisateur de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  updateManager(equipeId: number, newManagerId: number): Observable<EquipeDTO> {
    return this.http.put<EquipeDTO>(`${this.apiUrl}/equipes/${equipeId}/manager/${newManagerId}`, {}).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour du manager.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  assignUsersToEquipe(equipeId: number, userIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/equipes/${equipeId}/users`, userIds).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'assignation des utilisateurs à l\'équipe: ' + (error.error || error.message),
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getEquipeById(id: number): Observable<EquipeDTO> {
    return this.http.get<EquipeDTO>(`${this.apiUrl}/equipes/${id}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getTeamMembersByManagerId(managerId: number): Observable<TeamMemberDTO[]> {
    return this.http.get<TeamMemberDTO[]>(`${this.apiUrl}/equipes/manager/${managerId}/members`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des membres de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }
}