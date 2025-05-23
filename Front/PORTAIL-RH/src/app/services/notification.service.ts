// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  demandeId: number | null; // Allow null for POINTAGE notifications or publication ID for REACTION/COMMENT
  read: boolean;
  createdAt: string;
  userName: string;
  userImage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private ws: WebSocketSubject<any> | null = null;
  private apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  connectWebSocket(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.ws = webSocket('ws://localhost:8080/ws');
      this.ws.subscribe({
        next: (message) => {
          console.log('Notification reçue via WebSocket :', message);
          // Vérifier que le message est destiné à l'utilisateur connecté
          if (message.userId === parseInt(userId)) {
            // Convertir le message reçu (NotificationDTO) en Notification
            const notification: Notification = {
              id: message.id,
              userId: message.userId,
              message: message.message,
              type: message.type,
              demandeId: message.demandeId || null,
              read: message.read,
              createdAt: message.createdAt,
              userName: message.userName || 'Utilisateur',
              userImage: message.userImage || undefined,
            };
            const currentNotifications = this.notificationsSubject.value;
            this.notificationsSubject.next([notification, ...currentNotifications]);
          }
        },
        error: (error) => console.error('Erreur WebSocket :', error),
        complete: () => console.log('Connexion WebSocket fermée'),
      });
    } else {
      console.warn('Aucun userId trouvé dans localStorage, impossible de connecter WebSocket');
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.complete();
      this.ws = null;
    }
  }

  getNotifications(userId: number, isRead: boolean | null = null): Observable<Notification[]> {
    let url = `${this.apiUrl}?userId=${userId}`;
    if (isRead !== null) {
      url += `&isRead=${isRead}`;
    }
    return this.http.get<Notification[]>(url);
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mark-all-read?userId=${userId}`, {});
  }

  updateNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
  }
}