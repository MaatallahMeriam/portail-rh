import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface for CongeTypeDTO
export interface CongeTypeDTO {
  id?: number;
  type: 'RENOUVELABLE' | 'INCREMENTALE' | 'DECREMENTALE';
  unite: 'Jours' | 'Heure';
  soldeInitial: number;
  nom: string;
  abreviation: string;
  isGlobal: boolean;
  periodicite?: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  pasIncrementale?: number;
  validite: string; // Mandatory, format: yyyy-MM-dd
}

// Interface for UserCongesDTO
export interface UserCongesDTO {
  id?: number;
  unite: 'Jours' | 'Heure';
  userId: number;
  congeTypeId?: number;
  soldeActuel: number;
  type?: 'RENOUVELABLE' | 'INCREMENTALE' | 'DECREMENTALE';
  global?: boolean;
  nom?: string;
  abreviation?: string;
  periodicite?: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE';
  pasIncrementale?: number;
  validite: string; // Format: yyyy-MM-dd
  lastUpdated?: string; // Format: yyyy-MM-dd'T'HH:mm:ss
}

@Injectable({
  providedIn: 'root',
})
export class CongeTypeService {
  private congeTypeApiUrl = 'http://localhost:8080/api/conge-types';
  private userCongesApiUrl = 'http://localhost:8080/api/user-conges';

  constructor(private http: HttpClient) {}

  getAllCongeTypes(): Observable<CongeTypeDTO[]> {
    return this.http.get<CongeTypeDTO[]>(this.congeTypeApiUrl);
  }

  getGlobalCongeTypes(): Observable<CongeTypeDTO[]> {
    return this.http.get<CongeTypeDTO[]>(`${this.congeTypeApiUrl}/global`);
  }

  createCongeType(congeType: CongeTypeDTO): Observable<CongeTypeDTO> {
    return this.http.post<CongeTypeDTO>(this.congeTypeApiUrl, congeType);
  }

  updateCongeType(id: number, congeType: CongeTypeDTO): Observable<CongeTypeDTO> {
    return this.http.put<CongeTypeDTO>(`${this.congeTypeApiUrl}/${id}`, congeType);
  }

  deleteCongeType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.congeTypeApiUrl}/${id}`);
  }

  createUserConges(userConges: UserCongesDTO): Observable<UserCongesDTO> {
    return this.http.post<UserCongesDTO>(this.userCongesApiUrl, userConges);
  }

  getUserCongesById(id: number): Observable<UserCongesDTO> {
    return this.http.get<UserCongesDTO>(`${this.userCongesApiUrl}/${id}`);
  }

  getUserCongesByUserId(userId: number): Observable<UserCongesDTO[]> {
    return this.http.get<UserCongesDTO[]>(`${this.userCongesApiUrl}/user/${userId}`);
  }

  getAllCongeTypesForUser(userId: number): Observable<CongeTypeDTO[]> {
    return this.http.get<CongeTypeDTO[]>(`${this.userCongesApiUrl}/user/${userId}/all-conge-types`);
  }

  updateUserConges(id: number, userConges: UserCongesDTO): Observable<UserCongesDTO> {
    return this.http.put<UserCongesDTO>(`${this.userCongesApiUrl}/${id}`, userConges);
  }

  deleteUserConges(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userCongesApiUrl}/${id}`);
  }

  requestConge(userId: number, congeTypeId: number, daysRequested: number): Observable<void> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('congeTypeId', congeTypeId.toString())
      .set('daysRequested', daysRequested.toString());
    return this.http.post<void>(`${this.userCongesApiUrl}/request`, null, { params });
  }

  assignSpecificCongeType(userId: number, userConges: UserCongesDTO): Observable<UserCongesDTO> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<UserCongesDTO>(`${this.userCongesApiUrl}/specific`, userConges, { params });
  }

  updateSpecificCongeType(userId: number, congeTypeId: number, userConges: UserCongesDTO): Observable<UserCongesDTO> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('congeTypeId', congeTypeId.toString());
    return this.http.put<UserCongesDTO>(`${this.userCongesApiUrl}/specific`, userConges, { params });
  }

  deleteSpecificCongeType(userId: number, congeTypeId: number): Observable<void> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('congeTypeId', congeTypeId.toString());
    return this.http.delete<void>(`${this.userCongesApiUrl}/specific`, { params });
  }
}