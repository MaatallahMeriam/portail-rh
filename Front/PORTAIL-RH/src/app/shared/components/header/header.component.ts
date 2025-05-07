import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService, UserDTO } from '../../../services/users.service';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: UserDTO | null = null;
  notifications: Notification[] = [];
  notificationCount: number = 0;
  showNotificationsDropdown: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();

    // Connect to WebSocket and load notifications for all users
    this.notificationService.connectWebSocket();
    this.loadNotifications();

    this.subscription.add(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
        this.notificationCount = notifications.filter((n) => {
          const isRead = typeof n.read === 'string' ? n.read === 'true' : n.read;
          return !isRead;
        }).length;
        console.log('Notifications mises à jour :', notifications);
        console.log('Détails des notifications :', JSON.stringify(notifications, null, 2));
        console.log('Nombre de notifications non lues :', this.notificationCount);
      })
    );
  }

  loadUserInfo(): void {
    const userId = this.authService.getUserIdFromToken();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des données utilisateur', error);
        },
      });
    } else {
      console.warn('Aucun utilisateur authentifié');
      window.location.href = '/login';
    }
  }

  loadNotifications(): void {
    const userId = this.authService.getUserIdFromToken();
    if (userId) {
      // Charger toutes les notifications (lues et non lues)
      this.notificationService.getNotifications(userId, null).subscribe({
        next: (notifications) => {
          console.log('Toutes les notifications chargées :', notifications);
          this.notificationService.updateNotifications(notifications);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications', error);
        },
      });
    }
  }

  showNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;

    if (this.showNotificationsDropdown) {
      const userId = this.authService.getUserIdFromToken();
      if (userId && this.notificationCount > 0) {
        this.notificationService.markAllAsRead(userId).subscribe({
          next: () => {
            const updatedNotifications = this.notifications.map((n) => ({
              ...n,
              read: true,
            }));
            this.notificationService.updateNotifications(updatedNotifications);
            this.notificationCount = 0;
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour des notifications', error);
          },
        });
      }
    }
  }

  formatNotificationMessage(notification: Notification): string {
    const type = notification.type?.toLowerCase();
    const message = notification.message?.toLowerCase() || '';

    if (type === 'conges') {
      if (message.includes('acceptée')) {
        return 'Votre demande de congé a été acceptée';
      } else if (message.includes('refusée')) {
        return 'Votre demande de congé a été refusée';
      } else if (message.includes('membre')) {
        return notification.message; // Ex: "Membre John Doe a soumis une demande de congé"
      }
      return 'Nouvelle demande de congé';
    } else if (type === 'document') {
      if (message.includes('acceptée')) {
        return 'Votre demande de document a été acceptée';
      } else if (message.includes('refusée')) {
        return 'Votre demande de document a été refusée';
      }
      return notification.message; // Ex: "Nouvelle demande de document soumise par John Doe"
    } else if (type === 'logistique') {
      if (message.includes('acceptée')) {
        return 'Votre demande logistique a été acceptée';
      } else if (message.includes('refusée')) {
        return 'Votre demande logistique a été refusée';
      }
      return notification.message; // Ex: "Nouvelle demande logistique soumise par John Doe"
    }
    return message || 'Nouvelle notification';
  }

  goToDemande(notification: Notification): void {
    const userRole = this.authService.getUserRole();
    const notificationType = notification.type;
    const message = notification.message.toLowerCase();

    // Redirection logic based on user role and notification type
    if (userRole === 'RH') {
      if (notificationType === 'DOCUMENT' || notificationType === 'LOGISTIQUE') {
        this.router.navigate(['/valide-dmd']);
      } else if (notificationType === 'CONGES' && (message.includes('acceptée') || message.includes('refusée'))) {
        this.router.navigate(['/histo-dmd']);
      } else {
        this.router.navigate(['/trait-dmd-rh'], {
          queryParams: { demandeId: notification.demandeId },
        });
      }
    } else if (userRole === 'MANAGER') {
      if (notificationType === 'CONGES') {
        this.router.navigate(['/trait-dmd']);
      } else {
        this.router.navigate(['/manager-space'], {
          queryParams: { demandeId: notification.demandeId },
        });
      }
    }

    // Mark the notification as read if not already read
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (updatedNotification) => {
          const updatedNotifications = this.notifications.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n          );
          this.notificationService.updateNotifications(updatedNotifications);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la notification', error);
        },
      });
    }

    // Close the dropdown
    this.showNotificationsDropdown = false;
  }

  navigateToHome(): void {
    const userRole = this.authService.getUserRole();
    if (!userRole) {
      console.warn('Aucun rôle trouvé pour l\'utilisateur. Redirection vers la page de connexion.');
      this.router.navigate(['/login']);
      return;
    }

    switch (userRole) {
      case 'RH':
        this.router.navigate(['/rh-space']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin-space']);
        break;
      case 'MANAGER':
        this.router.navigate(['/manager-space']);
        break;
      case 'COLLAB':
        this.router.navigate(['/collab-space']);
        break;
      default:
        console.warn('Rôle non reconnu :', userRole);
        this.router.navigate(['/login']);
    }
  }

  navigateToTeam(): void {
    const userRole = this.authService.getUserRole();
    if (!userRole) {
      console.warn('Aucun rôle trouvé pour l\'utilisateur. Redirection vers la page de connexion.');
      this.router.navigate(['/login']);
      return;
    }

    switch (userRole) {
      case 'COLLAB':
        this.router.navigate(['/membre-collab']);
        break;
      case 'RH':
        this.router.navigate(['/membre-rh']);
        break;
      case 'MANAGER':
        this.router.navigate(['/details-eq']);
        break;
      default:
        console.warn('Rôle non reconnu pour la navigation vers la page équipe :', userRole);
        this.router.navigate(['/login']);
    }
  }

  navigateToProfile(): void {
    const userRole = this.authService.getUserRole();
    if (!userRole) {
      console.warn('Aucun rôle trouvé pour l\'utilisateur. Redirection vers la page de connexion.');
      this.router.navigate(['/login']);
      return;
    }

    switch (userRole) {
      case 'COLLAB':
        this.router.navigate(['/profile-collab']);
        break;
      case 'MANAGER':
        this.router.navigate(['/profil-manager']);
        break;
      case 'RH':
        this.router.navigate(['/profil-rh']);
        break;
      case 'ADMIN':
        this.router.navigate(['/profil-admin']);
        break;
      default:
        console.warn('Rôle non reconnu pour la navigation vers le profil :', userRole);
        this.router.navigate(['/login']);
    }
  }

  getUserImage(): string {
    return this.user?.image ? this.user.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.notificationService.disconnectWebSocket();
    this.subscription.unsubscribe();
  }
}