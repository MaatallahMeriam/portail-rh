import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, UserDTO } from '../../../../services/users.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details-dossier',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    RightSidebarComponent,
  ],
  templateUrl: './details-dossier.component.html',
  styleUrls: ['./details-dossier.component.scss'],
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
export class DetailsDossierComponent implements OnInit {
  user: UserDTO | null = null;
  isHeaderVisible = true;
  lastScrollPosition = 0;
  
  options = [
    { 
      label: 'Documents administratifs', 
      icon: 'assets/icons/un-journal.png', 
      route: '/dossier-user',
      description: 'Gérez vos documents administratifs'
    },
    { 
      label: 'Informations Personnelles', 
      icon: 'assets/icons/utilisateur.png', 
      route: '/info-user',
      description: 'Consultez vos informations personnelles'
    },
    { 
      label: 'Historique des demandes', 
      icon: 'assets/icons/conforme.png', 
      route: '/dmd-user-list',
      description: 'Suivez vos demandes en cours'
    },
    { 
      label: 'Détails congés', 
      icon: 'assets/icons/jour-de-conge.png', 
      route: '/details-conges',
      description: 'Gérez vos congés et absences'
    },
  ];
  
  isSidebarCollapsed = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userService.getUserById(+userId).subscribe({
        next: (user: UserDTO) => {
          this.user = user;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des détails de l\'utilisateur:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les détails de l\'utilisateur.',
            confirmButtonColor: '#230046'
          });
          this.router.navigate(['/gestion-dossier']);
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID utilisateur manquant.',
        confirmButtonColor: '#230046'
      });
      this.router.navigate(['/gestion-dossier']);
    }
  }

  navigateTo(route: string) {
    if (this.user && this.user.id) {
      const queryParamRoutes = ['/dossier-user', '/info-user','/details-conges','/dmd-user-list'];
      if (queryParamRoutes.includes(route)) {
        this.router.navigate([route], { queryParams: { userId: this.user.id } });
      } else {
        this.router.navigate([route, this.user.id]);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non chargé.',
        confirmButtonColor: '#230046'
      });
    }
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  onScroll(event: Event): void {
    const currentScrollPos = (event.target as Element).scrollTop;
    this.isHeaderVisible = currentScrollPos < this.lastScrollPosition || currentScrollPos < 50;
    this.lastScrollPosition = currentScrollPos;
  }
}