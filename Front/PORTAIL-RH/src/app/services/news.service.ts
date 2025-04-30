import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface NewsDTO {
  id: number;
  titre: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  userId: number;
  userNom: string;
}

export interface NewsUpdateRequest {
  titre: string;
  description: string;
  userId: number;
  type?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = 'http://localhost:8080/api/publications';

  constructor(private http: HttpClient) {}

  getAllNews(): Observable<NewsDTO[]> {
    return this.http.get<NewsDTO[]>(`${this.apiUrl}/news`).pipe(
      catchError(this.handleError)
    );
  }

  createNews(titre: string, description: string, image: File, userId: number): Observable<NewsDTO> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('userId', userId.toString());

    return this.http.post<NewsDTO>(`${this.apiUrl}/news/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/news/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateNews(id: number, titre: string, description: string, image: File | null, imageUrl: string): Observable<NewsDTO> {
    if (image) {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('image', image);

      return this.http.put<NewsDTO>(`${this.apiUrl}/news/${id}`, formData).pipe(
        catchError(this.handleError)
      );
    } else {
      const updateData: NewsUpdateRequest = {
        titre,
        description,
        type: 'NEWS',
        userId: 0, // Replace with actual userId if needed
        imageUrl: imageUrl
      };

      return this.http.put<NewsDTO>(`${this.apiUrl}/news/${id}/json`, updateData).pipe(
        catchError(this.handleError)
      );
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue.';
    if (error.status === 404) errorMessage = 'News introuvable.';
    else if (error.status === 400) errorMessage = error.error || 'Requête invalide.';
    return throwError(() => new Error(errorMessage));
  }
}