import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PublicationDTO {
    id?: number;
    type: 'FEED' | 'BOITE_IDEE' | 'NEWS';
    userId: number;
    userNom?: string;
    userPrenom?: string;
    userPhoto?: string;
    content?: string;
    mediaUrl?: string;
    idee?: string;
    topic?: string;
    image?: string;
    averageRating?: number; // For IdeeBoitePost
    createdAt: string;
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

@Injectable({
    providedIn: 'root'
})
export class PublicationService {
    private apiUrl = 'http://localhost:8080/api/publications';

    constructor(private http: HttpClient) {}

    // Helper method to create headers for JSON requests
    private getJsonHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    // Helper method to create headers for multipart requests
    private getMultipartHeaders(): HttpHeaders {
        return new HttpHeaders({
            // Note: Do not set Content-Type for multipart/form-data; the browser will set it with the correct boundary
        });
    }

    // FeedPost Operations
    createFeedPost(userId: string, content: string, media?: File): Observable<PublicationDTO> {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('content', content);
        if (media) {
            formData.append('media', media, media.name);
        }
        return this.http.post<PublicationDTO>(`${this.apiUrl}/feed`, formData, {
            headers: this.getMultipartHeaders()
        });
    }

    getAllFeedPosts(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/feed`);
    }

    updateFeedPost(id: number, userId: string, content?: string, media?: File): Observable<PublicationDTO> {
        const formData = new FormData();
        formData.append('userId', userId);
        if (content) {
            formData.append('content', content);
        }
        if (media) {
            formData.append('media', media, media.name);
        }
        return this.http.put<PublicationDTO>(`${this.apiUrl}/feed/${id}`, formData, {
            headers: this.getMultipartHeaders()
        });
    }

    deleteFeedPost(id: number, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/feed/${id}`, {
            params: { userId }
        });
    }

    // IdeeBoitePost Operations
    createIdeeBoitePost(userId: string, idee: string, topic: string, image?: File): Observable<PublicationDTO> {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('idee', idee);
        formData.append('topic', topic);
        if (image) {
            formData.append('image', image, image.name);
        }
        return this.http.post<PublicationDTO>(`${this.apiUrl}/idee-boite`, formData, {
            headers: this.getMultipartHeaders()
        });
    }

    getAllIdeeBoitePosts(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/idee-boite`);
    }

    updateIdeeBoitePost(id: number, userId: string, idee?: string, topic?: string, image?: File): Observable<PublicationDTO> {
        const formData = new FormData();
        formData.append('userId', userId);
        if (idee) {
            formData.append('idee', idee);
        }
        if (topic) {
            formData.append('topic', topic);
        }
        if (image) {
            formData.append('image', image, image.name);
        }
        return this.http.put<PublicationDTO>(`${this.apiUrl}/idee-boite/${id}`, formData, {
            headers: this.getMultipartHeaders()
        });
    }

    deleteIdeeBoitePost(id: number, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/idee-boite/${id}`, {
            params: { userId }
        });
    }

    // NewsPost Operations
    createNewsPost(userId: string, titre: string, description: string, image: File): Observable<PublicationDTO> {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('titre', titre);
        formData.append('description', description);
        formData.append('image', image, image.name);
        return this.http.post<PublicationDTO>(`${this.apiUrl}/news/upload`, formData, {
            headers: this.getMultipartHeaders()
        });
    }

    getAllNewsPosts(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/news`);
    }

    // IdeaRating Operations
    createIdeaRating(ratingRequest: IdeaRatingRequest): Observable<IdeaRatingDTO> {
        return this.http.post<IdeaRatingDTO>(`${this.apiUrl}/idee-boite/ratings`, ratingRequest, {
            headers: this.getJsonHeaders()
        });
    }

    getIdeaRatingsByPublicationId(publicationId: number): Observable<IdeaRatingDTO[]> {
        return this.http.get<IdeaRatingDTO[]>(`${this.apiUrl}/${publicationId}/ratings`);
    }

    // Comment Operations
    createComment(publicationId: number, commentRequest: CommentRequest): Observable<CommentDTO> {
        return this.http.post<CommentDTO>(`${this.apiUrl}/${publicationId}/comments`, commentRequest, {
            headers: this.getJsonHeaders()
        });
    }

    getCommentsByPublicationId(publicationId: number): Observable<CommentDTO[]> {
        return this.http.get<CommentDTO[]>(`${this.apiUrl}/${publicationId}/comments`);
    }

    deleteComment(commentId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`, {
            params: { userId: userId.toString() }
        });
    }

    // General Publication Operations
    getAllPublications(): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(this.apiUrl);
    }

    getPublicationsByUserId(userId: number): Observable<PublicationDTO[]> {
        return this.http.get<PublicationDTO[]>(`${this.apiUrl}/user/${userId}`);
    }

    getPublicationById(id: number): Observable<PublicationDTO> {
        return this.http.get<PublicationDTO>(`${this.apiUrl}/${id}`);
    }

    deletePublication(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}