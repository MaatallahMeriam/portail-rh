import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-admin.component.html',
  styleUrl: './sidebar-admin.component.scss'
})
export class SidebarAdminComponent {
  submenuVisible = false;
  constructor(private router: Router) {} 
  ngOnInit() {
    console.log('SidebarComponent initialisé');
  }

  toggleSubmenu(event: Event) {
    event.preventDefault();
    this.submenuVisible = !this.submenuVisible;
  }

  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }
}
