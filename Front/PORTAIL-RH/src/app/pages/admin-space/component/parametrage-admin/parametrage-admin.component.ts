import { Component } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import {RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import {HeaderComponent } from '../../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-parametrage-admin',
  standalone: true,
  imports: [RightSidebarComponent,SidebarAdminComponent,
    HeaderComponent,CommonModule
  ],
  templateUrl: './parametrage-admin.component.html',
  styleUrl: './parametrage-admin.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class ParametrageAdminComponent {
constructor(private router: Router) {} 
  options = [
    { label:  'Utilisateurs Actifs', icon: 'assets/icons/check.png', route: '/actif-list' },
    { label: 'Utilisateurs Archivés', icon: 'assets/icons/non.png', route: '/archive-list' },
    { label:  'Gestion News', icon: 'assets/icons/post.png', route: '/news-admin' },
    { label: 'Gestion Document', icon: 'assets/icons/attachment.png', route: '/doc-admin' },
  ];
  
  navigateTo(route: string) {
    console.log('Navigation vers :', route);
    this.router.navigate([route]);
  }
}
