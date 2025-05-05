import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserService } from '../../../../services/users.service'

interface MenuItem {
  label: string;
  route?: string;
  icon: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-side-bar-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-manager.component.html',
  styleUrl: './side-bar-manager.component.scss'
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
        { label: 'Demande Congés', route: 'dmd-conges-manager', icon: 'calendar' }
      ]
    },
    { label: 'Traitement Demandes', route: 'trait-dmd', icon: 'clipboard-check' },
    { label: 'Planning Télétravail', route: 'planning-manager', icon: 'calendar-week' },
    { label: 'Boîte à Idées', route: 'idee-manager', icon: 'lightbulb' },
    { label: 'Documenthèque', route: 'doc-manager', icon: 'folder' }
  ];

  private userName: string = 'Utilisateur';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log('SideBarManagerComponent initialisé');
    this.adjustSidebarForScreenSize();
    window.addEventListener('resize', () => this.adjustSidebarForScreenSize());
    console.log('AuthService injected:', !!this.authService);
    console.log('UserService injected:', !!this.userService);

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
}