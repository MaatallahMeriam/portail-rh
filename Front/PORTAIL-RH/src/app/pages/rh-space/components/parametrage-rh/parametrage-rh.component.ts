import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import {RightSidebarComponent} from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  
  selector: 'app-parametrage-rh',
  standalone: true,
  imports: [CommonModule,HeaderComponent,SidebarComponent,RightSidebarComponent],
  templateUrl: './parametrage-rh.component.html',
  styleUrl: './parametrage-rh.component.scss'
})
export class ParametrageRhComponent {
  constructor(private router: Router) {} 
  options = [
    { label: 'Gestion des dossiers', icon: 'assets/icons/folder.png', route: '/gestion-doss' },
    { label: 'Gestion des équipes', icon: 'assets/icons/group.png', route: '/list-equipe' },
    { label: 'Gestion des congés ', icon: 'assets/icons/adjustment.png', route: '/sold-list' },
    { label: 'Gestion des documents', icon: 'assets/icons/attachment.png', route: '/gestion-doc' },
    { label: 'Gestion des News', icon: 'assets/icons/post.png', route: '/news-list' },
    { label: 'Gestion Planning TT', icon: 'assets/icons/calendar.png', route: '/planning-rh' },
  ];
  isSidebarCollapsed = false;

  navigateTo(route: string) {
    console.log('Navigation vers :', route);
    this.router.navigate([route]);
  }
  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}
