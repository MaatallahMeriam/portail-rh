import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-side-bar-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar-manager.component.html',
  styleUrl: './side-bar-manager.component.scss'
})
export class SideBarManagerComponent {

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
