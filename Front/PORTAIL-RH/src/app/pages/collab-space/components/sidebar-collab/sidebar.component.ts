import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
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
