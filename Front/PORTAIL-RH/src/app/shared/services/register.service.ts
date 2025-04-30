import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

export interface RegisterRequest {
  userName: string;
  nom: string;
  prenom: string;
  mail: string;
  password: string;
  dateNaissance: string;
  age: number;
  poste: string;
  departement: string;
  role: string;
}
export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:8080' 
  };
export interface RegisterResponse {
  id: number;
  userName: string;
  mail: string;
  role: string;
  message: string;
}

export interface ResponseDossier {
  cvUrl: string;
  contratUrl: string;
  diplomeUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private apiUrl = `${environment.apiBaseUrl}/api`; 

  constructor(private http: HttpClient) {}

  registerUser(
    request: RegisterRequest,
    cv?: File | null,
    diplome?: File | null,
    contrat?: File | null
  ): Observable<RegisterResponse> {
    // Step 1: Register the user
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      switchMap((response: RegisterResponse) => {
        // If no files are provided, return the registration response directly
        if (!cv && !diplome && !contrat) {
          return new Observable<RegisterResponse>((observer) => {
            observer.next(response);
            observer.complete();
          });
        }

        // Step 2: Upload documents if provided
        const formData = new FormData();
        if (cv) formData.append('cv', cv, cv.name);
        if (diplome) formData.append('diplome', diplome, diplome.name);
        if (contrat) formData.append('contrat', contrat, contrat.name);

        return this.http
          .post<ResponseDossier>(
            `${this.apiUrl}/users/${response.id}/dossier/upload`,
            formData
          )
          .pipe(
            switchMap(() => {
              return new Observable<RegisterResponse>((observer) => {
                observer.next(response);
                observer.complete();
              });
            })
          );
      })
    );
  }
}