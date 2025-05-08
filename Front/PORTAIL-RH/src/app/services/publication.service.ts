import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PublicationDTO {
    id?: number;
    type: 'FEED' | 'BOITE_IDEE' | 'NEWS';
    userId: number;
    userNom?: string | null;
    userPrenom?: string | null;
    userPhoto?: string | null;
    content?: string | null;
    mediaUrl?: string | null;
    idee?: string | null;
    topic?: string | null;
    image?: string | null;
    averageRate?: number | null;
    createdAt: string;
    titre?: string | null;
    description?: string | null;
    documentDownloadUrl?: string | null; // Added to reflect the backend DTO
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

export interface CommentRequest {
    userId: number;
    publicationId: number;
    content: string;
}

export interface CommentUpdateRequest {
    userId: number;
    publicationId: number;
    content: string;
}

export interface IdeaRatingDTO {
    id?: number;
    userId: number;
    userNom: string;
    userPrenom: string;
    publicationId: number;
    rate: number;
}

export interface IdeaRatingRequest {
    userId: number;
    publicationId: number;
    rate: number;
}

export interface IdeeBoiteUpdateRequest {
    idee: string;
    topic: string;
    userId: number;
    type: 'BOITE_IDEE';
    image?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PublicationService {
    private apiUrl = 'http://localhost:8080/api/publications';
    private reactionApiUrl = 'http://localhost:8080/api/reactions';

    constructor(private http: HttpClient) {}

    private getJsonHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    private getMultipartHeaders(): HttpHeaders {
        return new HttpHeaders({});
    }

    private validateFile(file: File): boolean {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']; // Added document types
        const maxSize = 10 * 1024 * 1024; // Increased to 10MB to accommodate documents
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }

    createFeedPost(userId: string, content: string, media?: File, document?: File): Observable<PublicationDTO> {
        if (!content.trim()) {
            return throwError(() => new Error('Le contenu ne peut pas être vide.'));
        }
        if (media && !this.validateFile(media)) {
            return throwError(() => new Error('Fichier média invalide. Seuls les fichiers JPEG, PNG, GIF, PDF, DOC ou DOCX de moins de 10 Mo sont acceptés.'));
        }
        if (document && !this.validateFile(document)) {
            return throwError(() => new Error('Fichier document invalide. Seuls les fichiers PDF, DOC ou DOCX de moins de 10 Mo sont acceptés.'));
        }

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('content', content);
        if (media) {
            formData.append('media', media, media.name);
        }
        if (document) {
            formData.append('document', document, document.name);
        }
        return this.http.post<PublicationDTO>(`${this.apiUrl}/feed/upload`, formData, {
            headers: this.getMultipartHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    getAllFeedPosts(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/feed`).pipe(
            catchError(this.handleError)
        );
    }

    updateFeedPost(id: number, userId: string, content?: string, media?: File, document?: File): Observable<PublicationDTO> {
        if (media && !this.validateFile(media)) {
            return throwError(() => new Error('Fichier média invalide. Seuls les fichiers JPEG, PNG, GIF, PDF, DOC ou DOCX de moins de 10 Mo sont acceptés.'));
        }
        if (document && !this.validateFile(document)) {
            return throwError(() => new Error('Fichier document invalide. Seuls les fichiers PDF, DOC ou DOCX de moins de 10 Mo sont acceptés.'));
        }

        const formData = new FormData();
        formData.append('userId', userId);
        if (content) {
            formData.append('content', content);
        }
        if (media) {
            formData.append('media', media, media.name);
        }
        if (document) {
            formData.append('document', document, document.name);
        }
        return this.http.put<PublicationDTO>(`${this.apiUrl}/feed/${id}/upload`, formData, {
            headers: this.getMultipartHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    deleteFeedPost(id: number, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/feed/${id}`, {
            params: { userId }
        }).pipe(
            catchError(this.handleError)
        );
    }

    createIdeeBoitePost(userId: string, idee: string, topic: string, image: File): Observable<PublicationDTO> {
        if (!idee.trim() || !topic.trim()) {
            return throwError(() => new Error('L\'idée et le sujet ne peuvent pas être vides.'));
        }
        if (!image || !this.validateFile(image)) {
            return throwError(() => new Error('Image invalide. Seuls les fichiers JPEG, PNG ou GIF de moins de 5 Mo sont acceptés.'));
        }

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('idee', idee);
        formData.append('topic', topic);
        formData.append('image', image, image.name);
        return this.http.post<PublicationDTO>(`${this.apiUrl}/idee-boite/upload`, formData).pipe(
            catchError(this.handleError)
        );
    }

    getAllIdeeBoitePosts(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/idee-boite`).pipe(
            catchError(this.handleError)
        );
    }

    updateIdeeBoitePost(id: number, idee: string, topic: string, image: File | null, imageUrl: string | null, userId: string): Observable<PublicationDTO> {
        if (!idee.trim() || !topic.trim()) {
            return throwError(() => new Error('L\'idée et le sujet ne peuvent pas être vides.'));
        }
        if (image && !this.validateFile(image)) {
            return throwError(() => new Error('Image invalide. Seuls les fichiers JPEG, PNG ou GIF de moins de 5 Mo sont acceptés.'));
        }

        if (image) {
            const formData = new FormData();
            formData.append('idee', idee);
            formData.append('topic', topic);
            formData.append('image', image, image.name);
            return this.http.put<PublicationDTO>(`${this.apiUrl}/idee-boite/${id}`, formData).pipe(
                catchError(this.handleError)
            );
        } else {
            const updateData: IdeeBoiteUpdateRequest = {
                idee,
                topic,
                type: 'BOITE_IDEE',
                userId: parseInt(userId, 10),
                image: imageUrl || null
            };
            return this.http.put<PublicationDTO>(`${this.apiUrl}/idee-boite/${id}/json`, updateData, {
                headers: this.getJsonHeaders()
            }).pipe(
                catchError(this.handleError)
            );
        }
    }

    deleteIdeeBoitePost(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/idee-boite/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    createNewsPost(userId: string, titre: string, description: string, image: File): Observable<PublicationDTO> {
        if (!titre.trim() || !description.trim()) {
            return throwError(() => new Error('Le titre et la description ne peuvent pas être vides.'));
        }
        if (!image || !this.validateFile(image)) {
            return throwError(() => new Error('Image invalide. Seuls les fichiers JPEG, PNG ou GIF de moins de 5 Mo sont acceptés.'));
        }

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('titre', titre);
        formData.append('description', description);
        formData.append('image', image, image.name);
        return this.http.post<PublicationDTO>(`${this.apiUrl}/news/upload`, formData).pipe(
            catchError(this.handleError)
        );
    }

    getAllNewsPosts(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/news`).pipe(
            catchError(this.handleError)
        );
    }

    createIdeaRating(ratingRequest: IdeaRatingRequest): Observable<IdeaRatingDTO> {
        if (ratingRequest.rate < 1 || ratingRequest.rate > 5) {
            return throwError(() => new Error('La note doit être comprise entre 1 et 5.'));
        }
        return this.http.post<IdeaRatingDTO>(`${this.reactionApiUrl}/ratings`, ratingRequest, {
            headers: this.getJsonHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    getIdeaRatingsByPublicationId(publicationId: number): Observable<IdeaRatingDTO[]> {
        return this.http.get<IdeaRatingDTO[]>(`${this.reactionApiUrl}/publication/${publicationId}/ratings`).pipe(
            catchError(this.handleError)
        );
    }

    deleteIdeaRating(userId: number, publicationId: number): Observable<void> {
        return this.http.delete<void>(`${this.reactionApiUrl}/user/${userId}/publication/${publicationId}/rating`).pipe(
            catchError(this.handleError)
        );
    }

    createComment(publicationId: number, commentRequest: CommentRequest): Observable<CommentDTO> {
        if (!commentRequest.content.trim()) {
            return throwError(() => new Error('Le commentaire ne peut pas être vide.'));
        }
        return this.http.post<CommentDTO>(`${this.reactionApiUrl}/comment`, commentRequest, {
            headers: this.getJsonHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    updateComment(commentId: number, updateRequest: CommentUpdateRequest): Observable<CommentDTO> {
        if (!updateRequest.content.trim()) {
            return throwError(() => new Error('Le commentaire ne peut pas être vide.'));
        }
        return this.http.put<CommentDTO>(`${this.reactionApiUrl}/comment/${commentId}`, updateRequest, {
            headers: this.getJsonHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }

    getCommentsByPublicationId(publicationId: number): Observable<CommentDTO[]> {
        return this.http.get<CommentDTO[]>(`${this.reactionApiUrl}/publication/${publicationId}/comments`).pipe(
            catchError(this.handleError)
        );
    }

    deleteComment(commentId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.reactionApiUrl}/comment/${commentId}/user/${userId}`).pipe(
            catchError(this.handleError)
        );
    }

    getAllPublications(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    getPublicationsByUserId(userId: number): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/user/${userId}`).pipe(
            catchError(this.handleError)
        );
    }

    getPublicationById(id: number): Observable<PublicationDTO> {
        return this.http.get<PublicationDTO>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    deletePublication(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    downloadFeedDocument(publicationId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/feed/${publicationId}/document`, {
            responseType: 'blob'
        }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue.';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erreur côté client : ${error.error.message}`;
        } else {
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