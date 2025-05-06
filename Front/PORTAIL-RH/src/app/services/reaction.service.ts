import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ReactionDTO {
    id?: number;
    userId: number;
    userNom: string;
    userPrenom: string;
    publicationId: number;
}

export interface CommentDTO {
    id?: number;
    userId: number;
    userNom: string;
    userPrenom: string;
    userPhoto: string | null;
    publicationId: number;
    content: string;
    createdAt: Date;
}

export interface ReactionRequest {
    userId: number;
    publicationId: number;
}

export interface ReactionSummaryDTO {
    publicationId: number;
    totalLikes: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReactionService {
    private apiUrl = 'http://localhost:8080/api/reactions';

    constructor(private http: HttpClient) {}

    // Helper method to create headers for JSON requests
    private getJsonHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    // Create or update a like on a publication
    createOrUpdateReaction(reactionRequest: ReactionRequest): Observable<ReactionDTO> {
        return this.http.post<ReactionDTO>(`${this.apiUrl}/like`, reactionRequest, {
            headers: this.getJsonHeaders()
        });
    }

    // Fetch all likes for a publication
    getReactionsByPublicationId(publicationId: number): Observable<ReactionDTO[]> {
        return this.http.get<ReactionDTO[]>(`${this.apiUrl}/publication/${publicationId}/likes`);
    }

    // Fetch the reaction summary (total likes) for a publication
    getReactionSummaryByPublicationId(publicationId: number): Observable<ReactionSummaryDTO> {
        return this.http.get<ReactionSummaryDTO>(`${this.apiUrl}/publication/${publicationId}/summary`);
    }

    // Delete a like for a user and publication
    deleteReaction(userId: number, publicationId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/user/${userId}/publication/${publicationId}/like`);
    }

    // Delete an idea rating for a user and publication
    deleteIdeaRating(userId: number, publicationId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/user/${userId}/publication/${publicationId}/rating`).pipe(
            catchError(this.handleError)
        );
    }

    // Fetch all comments for a publication (optional, prefer PublicationService)
    getCommentsByPublicationId(publicationId: number): Observable<CommentDTO[]> {
        return this.http.get<CommentDTO[]>(`${this.apiUrl}/publication/${publicationId}/comments`);
    }

    // Delete a comment
    deleteComment(commentId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/comment/${commentId}/user/${userId}`);
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue.';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Erreur côté client : ${error.error.message}`;
        } else {
            // Server-side error
            if (error.status === 404) {
                errorMessage = 'Ressource introuvable. Vérifiez l\'URL ou l\'existence de la ressource.';
            } else if (error.status === 400) {
                errorMessage = error.error?.message || 'Requête invalide. Vérifiez les données envoyées.';
            } else if (error.status === 500) {
                errorMessage = 'Erreur interne du serveur. Contactez l\'administrateur.';
            } else {
                errorMessage = `Code d'erreur ${error.status}: ${error.error?.message || error.message}`;
            }
        }
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }
}