import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';

import { AuthService } from '../../../../shared/services/auth.service';
import { EquipeService, TeamMemberDTO, EquipeDTO } from '../../../../services/equipe.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-equipe-admin',
  standalone: true,
  imports: [SidebarAdminComponent,
    CommonModule,
    MatIconModule,
    MatRippleModule,
    HeaderComponent,
  ],
  templateUrl: './equipe-admin.component.html',
  styleUrl: './equipe-admin.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class EquipeAdminComponent implements OnInit {
  equipe: EquipeDTO | null = null;
  manager: UserDTO | null = null;
  teamMembers: TeamMemberDTO[] = [];
  isSidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private equipeService: EquipeService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      this.showError('Non authentifié', 'Veuillez vous connecter pour accéder à cette page.');
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.loadTeamData(userId);
  }

  private loadTeamData(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (!user.equipeId) {
          this.showInfo('Aucune équipe', 'Vous n\'êtes assigné à aucune équipe pour le moment.');
          return;
        }

        forkJoin({
          equipe: this.equipeService.getEquipeById(user.equipeId),
          manager: this.equipeService.getManagerByEquipeId(user.equipeId),
          members: this.equipeService.getUsersByEquipeIdExcludingManager(user.equipeId)
        }).subscribe({
          next: ({ equipe, manager, members }) => {
            this.equipe = equipe;
            this.manager = manager;
            this.teamMembers = this.sortTeamMembers(members);
          },
          error: (error) => {
            console.error('Error loading team data:', error);
            this.showError('Erreur', 'Impossible de charger les données de l\'équipe.');
          }
        });
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.showError('Erreur', 'Impossible de charger vos informations.');
      }
    });
  }

  private sortTeamMembers(members: TeamMemberDTO[]): TeamMemberDTO[] {
    return members.sort((a, b) => {
      
      // Then by name
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/icons/user-login-icon-14.png';
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }


  private showError(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#5b2e91'
    });
  }

  private showInfo(title: string, text: string): void {
    Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#5b2e91'
    });
  }
}