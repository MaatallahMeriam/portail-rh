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
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  
  isSidebarCollapsed = false;
  @Output() sidebarStateChange = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [
    {
      label: 'Demandes',
      icon: 'file-text',
      expanded: false,
      children: [
        { label: 'Documents', route: '/demandeDocCollab', icon: 'file-earmark-text' },
        { label: 'Logistique', route: '/demandeLogCollab', icon: 'box' },
        { label: 'Congés', route: '/demandeCongCollab', icon: 'calendar' }
      ]
    },
  { label: 'Liste Projets', route: '/projet-collab', icon: 'kanban', hasNotification: false },

    { label: 'Planning Télétravail', route: '/planning-user', icon: 'calendar-week', hasNotification: false },
    { label: 'Boîte à Idées', route: '/idee-collab', icon: 'lightbulb' },
    { label: 'Documenthèque', route: '/doc-collab', icon: 'folder' }
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
    console.log('SidebarComponent initialisé');
    this.adjustSidebarForScreenSize();
    window.addEventListener('resize', () => this.adjustSidebarForScreenSize());
    console.log('AuthService injected:', !!this.authService);
    console.log('UserService injected:', !!this.userService);
    console.log('NotifPointageService injected:', !!this.notifPointageService);

    // Fetch user profile
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
        }
      });
    } else {
      console.log('No user ID found, falling back to default');
    }

    // Vérifier les notifications de pointage
    this.checkPendingNotification();

    // Emit initial state
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
      if (route === '/planning-user' && this.currentNotification) {
        this.acknowledgeNotification(this.currentNotification.id);
      }

      // Auto-collapse sidebar on navigation for mobile devices
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
        const planningItem = this.menuItems.find(item => item.route === '/planning-user');
        if (planningItem) {
          planningItem.hasNotification = !!notification;
        }
        console.log('Notification checked:', notification);
      },
      error: (err) => {
        console.error('Error checking notification:', err);
      }
    });
  }

  private acknowledgeNotification(notificationId: number) {
    this.notifPointageService.acknowledgeNotification(notificationId).subscribe({
      next: () => {
        const planningItem = this.menuItems.find(item => item.route === '/planning-user');
        if (planningItem) {
          planningItem.hasNotification = false;
        }
        this.currentNotification = null;
        console.log('Notification acknowledged:', notificationId);
      },
      error: (err) => {
        console.error('Error acknowledging notification:', err);
      }
    });
  }
}