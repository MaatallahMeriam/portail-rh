import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { OptionCard } from './models/option.model';

@Component({
  selector: 'app-parametrage-rh',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, RightSidebarComponent],
  templateUrl: './parametrage-rh.component.html',
  styleUrl: './parametrage-rh.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ParametrageRhComponent {
  options: OptionCard[] = [
    { 
      label: 'Gestion des dossiers', 
      icon: 'assets/icons/folder.png', 
      route: '/gestion-doss',
      description: 'Gérer tous vos dossiers RH'
    },
    { 
      label: 'Gestion des équipes', 
      icon: 'assets/icons/group.png', 
      route: '/list-equipe',
      description: 'Organisation et suivi d\'équipes'
    },
    { 
      label: 'Gestion des congés', 
      icon: 'assets/icons/adjustment.png', 
      route: '/sold-list',
      description: 'Demandes et soldes de congés'
    },
    { 
      label: 'Gestion des documents', 
      icon: 'assets/icons/attachment.png', 
      route: '/gestion-doc',
      description: 'Archivage et stockage sécurisé'
    },
    { 
      label: 'Gestion des News', 
      icon: 'assets/icons/post.png', 
      route: '/news-list',
      description: 'Actualités et communications'
    },
    { 
      label: 'Gestion Planning TT', 
      icon: 'assets/icons/calendar.png', 
      route: '/planning-rh',
      description: 'Calendrier et planification'
    },
  ];
  
  isSidebarCollapsed = false;
  isHeaderVisible = true;
  lastScrollPosition = 0;

  constructor(private router: Router) {}

  navigateTo(route: string) {
    console.log('Navigation vers :', route);
    this.router.navigate([route]);
  }
  
  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const currentScrollPos = window.pageYOffset;
    this.isHeaderVisible = currentScrollPos < this.lastScrollPosition || currentScrollPos < 50;
    this.lastScrollPosition = currentScrollPos;
  }
}