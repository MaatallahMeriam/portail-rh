import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from './users.service';
// Ajuster les DTOs pour correspondre au backend
export interface EmployeCompetenceDTO {
  employeId: number;
  competenceNom: string;
  niveau: string;
}

export interface ProjetDTO {
  id?: number;
  nom: string;
  description: string;
  competencesRequises: ProjetCompetenceDTO[];
  cahierCharge?: Uint8Array;
}

export interface ProjetCompetenceDTO {
  competenceNom: string;
  niveauRequis: string; // Ajouté pour correspondre à l'entité backend
}

export interface ProjetAffectationDTO {
  projetId: number;
  employeId: number;
}

export interface MatchingResultDTO {
  employeId: number;
  employeNom: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  private apiUrl = 'http://localhost:8080/api/competences';

  constructor(private http: HttpClient) {}

  // Ajouter une compétence à un employé
  addEmployeCompetence(employeCompetence: EmployeCompetenceDTO): Observable<EmployeCompetenceDTO> {
    return this.http.post<EmployeCompetenceDTO>(`${this.apiUrl}/employe`, employeCompetence);
  }
  searchUsersByCompetence(competenceNom: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/search/competence?nom=${encodeURIComponent(competenceNom)}`);
  }
  getProjetsByEmploye(employeId: number): Observable<ProjetDTO[]> {
  return this.http.get<ProjetDTO[]>(`${this.apiUrl}/employe/${employeId}/projets`);
}
  desaffecterEmployeAProjet(projetId: number, employeId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/affectation/${projetId}/${employeId}`);
}
getAffectationsByProjet(projetId: number): Observable<ProjetAffectationDTO[]> {
  return this.http.get<ProjetAffectationDTO[]>(`${this.apiUrl}/projet/${projetId}/affectations`);
}
  // Créer un nouveau projet avec des données multipart/form-data
  createProjet(formData: FormData): Observable<ProjetDTO> {
    return this.http.post<ProjetDTO>(`${this.apiUrl}/projet`, formData, {
      headers: new HttpHeaders()
    });
  }
  deleteProjet(projetId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/projet/${projetId}`);
}
getProjetById(projetId: number): Observable<ProjetDTO> {
  return this.http.get<ProjetDTO>(`${this.apiUrl}/projet/${projetId}`);
}
  // Affecter un employé à un projet
  affecterEmployeAProjet(affectation: ProjetAffectationDTO): Observable<ProjetAffectationDTO> {
    return this.http.post<ProjetAffectationDTO>(`${this.apiUrl}/affectation`, affectation);
  }

  // Obtenir les résultats de matching pour un projet
  matchEmployesToProjet(projetId: number): Observable<MatchingResultDTO[]> {
    return this.http.get<MatchingResultDTO[]>(`${this.apiUrl}/projet/${projetId}/matching`);
  }

  // Obtenir les compétences d'un employé
  getCompetencesByEmploye(employeId: number): Observable<EmployeCompetenceDTO[]> {
    return this.http.get<EmployeCompetenceDTO[]>(`${this.apiUrl}/employe/${employeId}`);
  }

  // Obtenir les compétences d'une équipe
  getCompetencesByEquipe(equipeId: number): Observable<EmployeCompetenceDTO[]> {
    return this.http.get<EmployeCompetenceDTO[]>(`${this.apiUrl}/equipe/${equipeId}`);
  }

  // Récupérer la liste des projets
  getAllProjets(): Observable<ProjetDTO[]> {
    return this.http.get<ProjetDTO[]>(`${this.apiUrl}/projet`);
  }

  // Télécharger le cahier de charges
  downloadCahierCharge(projetId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/projet/${projetId}/cahierCharge/download`, {
      responseType: 'blob'
    });
  }
}