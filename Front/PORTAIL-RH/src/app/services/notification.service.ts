import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  demandeId: number;
  read: boolean;
  createdAt: string;
  userName: string; // Added: Full name of the user who triggered the notification
  userImage?: string; // Added: URL to the user's profile photo
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private ws: WebSocketSubject<any> | null = null;

  constructor(private http: HttpClient) {}

  connectWebSocket(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.ws = webSocket(`ws://localhost:8080/ws`);
      this.ws.subscribe({
        next: (message) => {
          if (message.userId === parseInt(userId)) {
            const currentNotifications = this.notificationsSubject.value;
            this.notificationsSubject.next([message, ...currentNotifications]);
          }
        },
        error: (error) => console.error('Erreur WebSocket :', error),
        complete: () => console.log('Connexion WebSocket fermée'),
      });
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.complete();
      this.ws = null;
    }
  }

  getNotifications(userId: number, isRead: boolean | null = null): Observable<Notification[]> {
    let url = `http://localhost:8080/api/notifications?userId=${userId}`;
    if (isRead !== null) {
      url += `&isRead=${isRead}`;
    }
    return this.http.get<Notification[]>(url);
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.patch<Notification>(`http://localhost:8080/api/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`http://localhost:8080/api/notifications/mark-all-read?userId=${userId}`, {});
  }

  updateNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
  }
}