import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, combineLatest } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../shared/services/auth.service'; // Ajustez le chemin selon votre structure
import { UserService, UserDTO } from './users.service'; // Ajustez le chemin selon votre structure

export interface DemandeRequest {
  type: string;
  userId: number;
  // Common fields for all demande types
  typeDocument?: string;
  nombreCopies?: number;
  raisonDmdDoc?: string;
  raisonDmdLog?: string;
  commentaireLog?: string;
  departement?: string;
  composant?: string;
  // Specific fields for Dmd_Conges
  fileUrl?: string;
  commentaires?: string;
  dateDebut?: string; // ISO format: yyyy-MM-dd
  dateFin?: string;   // ISO format: yyyy-MM-dd
  unite?: 'Jours' | 'Heure';
  duree?: number;
  userCongesId?: number;
}

export interface DemandeDTO {
  id: number;
  type: string;
  statut: string;
  userId: number;
  userNom: string;
  dateEmission: string;
  dateValidation?: string;
  // Fields for Dmd_Conges
  fileUrl?: string;
  commentaires?: string;
  dateDebut?: string;
  dateFin?: string;
  unite?: 'Jours' | 'Heure';
  duree?: number;
  userCongesId?: number;
  // Fields for Dmd_Doc
  typeDocument?: string;
  nombreCopies?: number;
  raisonDmd?: string;
  // Fields for Dmd_Log
  raisonDmdLog?: string;
  commentaire?: string;
  departement?: string;
  composant?: string;
}

export interface ManagerCongesDemandeDTO {
  userId: number;
  nom: string;
  prenom: string;
  demandeId: number;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
  dateEmission: string;
  dateValidation?: string;
  congeNom: string;
  dateDebut: string;
  dateFin: string;
  duree: number;
  unite: 'Jours' | 'Heure';
  soldeActuel: number;
}

export interface LogisticDemandeDTO {
  userId: number;
  nom: string;
  prenom: string;
  demandeId: number;
  dateEmission: string;
  raisonDmd: string;
  commentaire: string;
  departement: string;
  composant: string;
}

export interface DocumentDemandeDTO {
  userId: number;
  nom: string;
  prenom: string;
  demandeId: number;
  dateEmission: string;
  raisonDmd: string;
  typeDocument: string;
  nombreCopies: number;
}

export interface UserDemandeDetailsDTO {
  demandeId: number;
  type: string;
  statut: string;
  dateEmission: string;
  dateValidation?: string;
  userId: number;
  userFullName: string; // nom + prenom
  userPhoto?: string;   // image URL
}

@Injectable({
  providedIn: 'root',
})
export class DemandeService {
  private apiUrl = 'http://localhost:8080/api/demandes';

  constructor(
    private http: HttpClient,
    private authService: AuthService, // Injecter AuthService
    private userService: UserService
  ) {}

  createDemande(request: DemandeRequest): Observable<DemandeDTO> {
    return this.http.post<DemandeDTO>(this.apiUrl, request).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors de la soumission de la demande.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getDemandesByUserIdAndType(userId: number, type: string): Observable<DemandeDTO[]> {
    return this.http.get<DemandeDTO[]>(`${this.apiUrl}/user/${userId}/type/${type}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement de l\'historique des demandes.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getAllDemandesByUserId(userId: number): Observable<DemandeDTO[]> {
    return this.http.get<DemandeDTO[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement de toutes les demandes.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  // New method to get all demands with user details
  getUserDemandeDetails(userId: number): Observable<UserDemandeDetailsDTO[]> {
    return combineLatest([
      this.getAllDemandesByUserId(userId), // Fetch all demands for the user
      this.userService.getUserById(userId) // Fetch user details
    ]).pipe(
      map(([demandes, user]) => {
        return demandes.map(demande => ({
          demandeId: demande.id,
          type: demande.type,
          statut: demande.statut,
          dateEmission: demande.dateEmission,
          dateValidation: demande.dateValidation,
          userId: demande.userId,
          userFullName: `${user.nom} ${user.prenom}`, // Combine nom and prenom
          userPhoto: user.image ? user.image.replace(/\\/g, '/') : undefined // Normalize image URL
        }));
      }),
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des détails des demandes.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  updateDemande(id: number, request: DemandeRequest): Observable<DemandeDTO> {
    return this.http.put<DemandeDTO>(`${this.apiUrl}/${id}`, request).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour de la demande.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  deleteDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression de la demande.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  changeStatut(id: number, statut: string): Observable<DemandeDTO> {
    return this.http.put<DemandeDTO>(`${this.apiUrl}/${id}/statut`, { statut }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour du statut.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  acceptDemande(id: number): Observable<DemandeDTO> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.put<DemandeDTO>(`${this.apiUrl}/${id}/accept`, {}, { params }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors de l\'acceptation de la demande.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  refuseDemande(id: number): Observable<DemandeDTO> {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non authentifié.'));
    }
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.put<DemandeDTO>(`${this.apiUrl}/${id}/refuse`, {}, { params }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Erreur lors du refus de la demande.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getCongesDemandesByManagerId(managerId: number, statut?: string): Observable<ManagerCongesDemandeDTO[]> {
    let params = new HttpParams();
    if (statut) {
      params = params.set('statut', statut);
    }
    return this.http.get<ManagerCongesDemandeDTO[]>(`${this.apiUrl}/manager/${managerId}/conges`, { params }).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes de congé de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getAllDemandeCongesByEquipeAndManagerId(managerId: number, equipeId: number): Observable<ManagerCongesDemandeDTO[]> {
    return this.http.get<ManagerCongesDemandeDTO[]>(`${this.apiUrl}/manager/${managerId}/equipe/${equipeId}/conges`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes de congé de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getPendingLogisticDemandes(): Observable<LogisticDemandeDTO[]> {
    return this.http.get<LogisticDemandeDTO[]>(`${this.apiUrl}/pending/logistique`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes logistiques en attente.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getPendingDocumentDemandes(): Observable<DocumentDemandeDTO[]> {
    return this.http.get<DocumentDemandeDTO[]>(`${this.apiUrl}/pending/document`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes de documents en attente.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getAllDemandeDocumentAndLogistique(): Observable<DemandeDTO[]> {
    return this.http.get<DemandeDTO[]>(`${this.apiUrl}/document-and-logistique`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes de documents et logistiques.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getAllCongesDemandes(): Observable<ManagerCongesDemandeDTO[]> {
    return this.http.get<ManagerCongesDemandeDTO[]>(`${this.apiUrl}/conges/all`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement de toutes les demandes de congé.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getValidatedCongesDemandesByManagerId(managerId: number): Observable<ManagerCongesDemandeDTO[]> {
    return this.http.get<ManagerCongesDemandeDTO[]>(`${this.apiUrl}/manager/${managerId}/conges/validated`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes de congé validées de l\'équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }
}