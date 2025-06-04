import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserService } from '../../../../services/users.service';
import { NotifPointageService, PointageNotificationDTO } from '../../../../services/notif-pointage.service';

interface MenuItem {
  label: string;
  route?: string;
  icon: string;
  children?: MenuItem[];
  expanded?: boolean;
  hasNotification?: boolean; // Ajout pour indiquer une notification
}

@Component({
  selector: 'app-side-bar-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-manager.component.html',
  styleUrl: './side-bar-manager.component.scss',
})
export class SideBarManagerComponent implements OnInit {
  isSidebarCollapsed = false;
  @Output() sidebarStateChange = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [
    {
      label: 'Soumettre Demandes',
      icon: 'file-text',
      expanded: false,
      children: [
        { label: 'Demande Document', route: 'dmd-doc-manager', icon: 'file-earmark-text' },
        { label: 'Demande Logistique', route: 'dmd-log-manager', icon: 'box' },
        { label: 'Demande Congés', route: 'dmd-conges-manager', icon: 'calendar' },
      ],
    },
    { label: 'Traitement Demandes', route: 'trait-dmd', icon: 'clipboard-check' },
    { label: 'Gestion Projets', route: 'gest-proj-manager', icon: 'kanban' },

    { label: 'Planning Télétravail', route: 'planning-manager', icon: 'calendar-week', hasNotification: false },
    { label: 'Boîte à Idées', route: 'idee-manager', icon: 'lightbulb' },
    { label: 'Documenthèque', route: 'doc-manager', icon: 'folder' },
  ];

  private userName: string = 'Utilisateur';
  private currentNotification: PointageNotificationDTO | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private notifPointageService: NotifPointageService
  ) {}

  ngOnInit() {
    console.log('SideBarManagerComponent initialisé');
    this.adjustSidebarForScreenSize();
    window.addEventListener('resize', () => this.adjustSidebarForScreenSize());
    console.log('AuthService injected:', !!this.authService);
    console.log('UserService injected:', !!this.userService);
    console.log('NotifPointageService injected:', !!this.notifPointageService);

    const userId = this.authService.getUserIdFromToken();
    console.log('User ID from token:', userId);
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.userName = `${user.userName}`;
          console.log('User profile fetched:', this.userName);
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
          this.userName = 'Utilisateur';
        },
      });
    } else {
      console.log('No user ID found, falling back to default');
    }

    // Vérifier les notifications de pointage
    this.checkPendingNotification();

    this.sidebarStateChange.emit(this.isSidebarCollapsed);
  }

  adjustSidebarForScreenSize() {
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed = true;
    }
    this.sidebarStateChange.emit(this.isSidebarCollapsed);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarStateChange.emit(this.isSidebarCollapsed);
  }

  toggleSubmenu(item: MenuItem, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    item.expanded = !item.expanded;
  }

  navigateTo(route: string | undefined) {
    if (route) {
      console.log('Navigating to:', route);
      this.router.navigate([route]);

      // Si navigation vers Planning Télétravail, marquer la notification comme reconnue
      if (route === 'planning-manager' && this.currentNotification) {
        this.acknowledgeNotification(this.currentNotification.id);
      }

      if (window.innerWidth < 768) {
        this.isSidebarCollapsed = true;
        this.sidebarStateChange.emit(this.isSidebarCollapsed);
      }
    }
  }

  getUserName(): string {
    console.log('getUserName called, returning:', this.userName);
    return this.userName;
  }

  logout() {
    this.authService.logout();
  }

  private checkPendingNotification() {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.notifPointageService.checkPendingNotification(today).subscribe({
      next: (notification) => {
        this.currentNotification = notification;
        const planningItem = this.menuItems.find((item) => item.route === 'planning-manager');
        if (planningItem) {
          planningItem.hasNotification = !!notification;
        }
        console.log('Notification checked:', notification);
      },
      error: (err) => {
        console.error('Error checking notification:', err);
      },
    });
  }

  private acknowledgeNotification(notificationId: number) {
    this.notifPointageService.acknowledgeNotification(notificationId).subscribe({
      next: () => {
        const planningItem = this.menuItems.find((item) => item.route === 'planning-manager');
        if (planningItem) {
          planningItem.hasNotification = false;
        }
        this.currentNotification = null;
        console.log('Notification acknowledged:', notificationId);
      },
      error: (err) => {
        console.error('Error acknowledging notification:', err);
      },
    });
  }
}