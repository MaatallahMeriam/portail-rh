import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DocumentDTO {
  id: number;
  name: string;
  type: string;
  url: string;
  description: string;
  categorie: string;
}

export interface DocumentUpdateRequest {
  name: string;
  description: string;
  url?: string;
  categorie: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(file: File, description: string, categorie: string): Observable<DocumentDTO> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('description', description);
    formData.append('categorie', categorie);

    return this.http.post<DocumentDTO>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getAllDocuments(): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(`${this.apiUrl}/get`).pipe(
      catchError(this.handleError)
    );
  }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return this.http.get<DocumentDTO>(`${this.apiUrl}/get/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateDocument(id: number, name: string, description: string, categorie: string, file: File | null, url: string): Observable<DocumentDTO> {
    if (file) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('categorie', categorie);
      formData.append('file', file);

      return this.http.put<DocumentDTO>(`${this.apiUrl}/update/${id}`, formData).pipe(
        catchError(this.handleError)
      );
    } else {
      const updateData: DocumentUpdateRequest = {
        name,
        description,
        url,
        categorie
      };
      return this.http.put<DocumentDTO>(`${this.apiUrl}/update/${id}/json`, updateData).pipe(
        catchError(this.handleError)
      );
    }
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue.';
    if (error.status === 404) errorMessage = 'Document introuvable.';
    else if (error.status === 400) errorMessage = error.error || 'Requête invalide.';
    return throwError(() => new Error(errorMessage));
  }
}