import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar-RH/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import {HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-trait-dmd-rh',
  standalone: true,
  imports: [SidebarComponent,RightSidebarComponent,
    HeaderComponent,CommonModule

  ],
  templateUrl: './trait-dmd-rh.component.html',
  styleUrl: './trait-dmd-rh.component.scss'
})
export class TraitDmdRhComponent {
constructor(private router: Router) {} 
  options = [
    { label: 'Historique Demandes Congés', icon: 'assets/icons/calendrier.png', route: '/histo-dmd' },
    { label: 'Traitement Des Demandes', icon: 'assets/icons/validation.png', route: '/valide-dmd' },
    
  ];

  navigateTo(route: string) {
    console.log('Navigation vers :', route);
    this.router.navigate([route]);
  }
}
