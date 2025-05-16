import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { UserService, UserDTO } from '../../../../services/users.service';
import { EquipeService, EquipeDTO } from '../../../../services/equipe.service';

@Component({
  selector: 'app-details-equipe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './details-equipe.component.html',
  styleUrl: './details-equipe.component.scss',
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DetailsEquipeComponent implements OnInit {
  equipe: EquipeDTO | null = null;
  manager: UserDTO | null = null;
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  managerUsers: UserDTO[] = [];
  filteredManagerUsers: UserDTO[] = [];
  teamMembers: UserDTO[] = [];
  searchText: string = '';
  showAddMemberForm: boolean = false;
  showManagerForm: boolean = false;
  selectedUserIds: number[] = [];
  managerSearchText: string = '';
  showManagerMenu: boolean = false;
  selectedManagerId: number | null = null;
  isSidebarCollapsed = false;

  constructor(
    private equipeService: EquipeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const equipeId = Number(this.route.snapshot.paramMap.get('id'));
    if (equipeId) {
      this.loadEquipeDetails(equipeId);
      this.loadTeamMembers(equipeId);
      this.loadManager(equipeId);
      this.loadUsers();
    } else {
      this.showError('ID de l\'équipe non valide');
      this.router.navigate(['/list-equipes']);
    }
  }

  loadEquipeDetails(equipeId: number): void {
    this.equipeService.getEquipeById(equipeId).subscribe({
      next: (equipe) => {
        this.equipe = equipe;
      },
      error: () => {
        this.showError('Impossible de charger les détails de l\'équipe');
        this.router.navigate(['/list-equipes']);
      }
    });
  }

  loadTeamMembers(equipeId: number): void {
    this.equipeService.getUsersByEquipeIdExcludingManager(equipeId).subscribe({
      next: (members) => {
        this.teamMembers = members;
      },
      error: () => {
        this.showError('Impossible de charger les membres de l\'équipe');
      }
    });
  }

  loadManager(equipeId: number): void {
    this.equipeService.getManagerByEquipeId(equipeId).subscribe({
      next: (manager) => {
        this.manager = manager;
      },
      error: () => {
        this.manager = null;
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllActiveUsersWithNoEquipe().subscribe({
      next: (users) => {
        this.users = users.map(user => ({ ...user, checked: false }));
        this.filteredUsers = [...this.users];
      },
      error: () => {
        this.showError('Impossible de charger les utilisateurs');
      }
    });

    this.userService.getAllActiveUsers().subscribe({
      next: (users) => {
        this.managerUsers = users;
        this.filteredManagerUsers = [...users];
      },
      error: () => {
        this.showError('Impossible de charger les managers potentiels');
      }
    });
  }

  filterUsers(): void {
    if (!this.searchText.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    const search = this.searchText.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.nom?.toLowerCase().includes(search) ||
      user.prenom?.toLowerCase().includes(search) ||
      user.departement?.toLowerCase().includes(search) ||
      user.poste?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  }

  filterManagers(): void {
    if (!this.managerSearchText.trim()) {
      this.filteredManagerUsers = [...this.managerUsers];
      return;
    }
    const search = this.managerSearchText.toLowerCase().trim();
    this.filteredManagerUsers = this.managerUsers.filter(user =>
      user.nom?.toLowerCase().includes(search) ||
      user.prenom?.toLowerCase().includes(search) ||
      user.departement?.toLowerCase().includes(search)
    );
  }

  toggleAddMemberForm(): void {
    this.showAddMemberForm = !this.showAddMemberForm;
    if (!this.showAddMemberForm) {
      this.resetAddMemberForm();
    }
  }

  toggleManagerForm(): void {
    this.showManagerForm = !this.showManagerForm;
    this.showManagerMenu = false;
    if (!this.showManagerForm) {
      this.resetManagerForm();
    }
  }

  toggleManagerMenu(): void {
    this.showManagerMenu = !this.showManagerMenu;
  }

  selectManager(userId: number): void {
    this.selectedManagerId = userId;
  }

  confirmManagerSelection(): void {
    if (!this.selectedManagerId) {
      this.showWarning('Veuillez sélectionner un manager');
      return;
    }

    if (this.equipe) {
      this.equipeService.updateManager(this.equipe.id, this.selectedManagerId).subscribe({
        next: () => {
          this.showSuccess('Manager mis à jour avec succès');
          this.loadManager(this.equipe!.id);
          this.loadTeamMembers(this.equipe!.id);
          this.toggleManagerForm();
        },
        error: (error) => {
          this.showError(error.error || 'Erreur lors de la mise à jour du manager');
        }
      });
    }
  }

  onUserSelect(userId: number, checked: boolean): void {
    if (checked) {
      this.selectedUserIds.push(userId);
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    }
  }

  addSelectedUsersToTeam(): void {
    if (!this.equipe) {
      this.showError('Équipe non trouvée');
      return;
    }

    if (this.selectedUserIds.length === 0) {
      this.showWarning('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    this.equipeService.assignUsersToEquipe(this.equipe.id, this.selectedUserIds).subscribe({
      next: () => {
        this.showSuccess('Membres ajoutés avec succès');
        this.loadTeamMembers(this.equipe!.id);
        this.toggleAddMemberForm();
      },
      error: (error) => {
        this.showError(error.error || 'Erreur lors de l\'ajout des membres');
      }
    });
  }

  removeUserFromTeam(userId: number): void {
    if (!this.equipe) {
      this.showError('Équipe non trouvée');
      return;
    }

    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment retirer ce membre de l\'équipe ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.equipeService.removeUserFromEquipe(this.equipe!.id, userId).subscribe({
          next: () => {
            this.showSuccess('Membre retiré avec succès');
            this.loadTeamMembers(this.equipe!.id);
          },
          error: (error) => {
            this.showError(error.error || 'Erreur lors du retrait du membre');
          }
        });
      }
    });
  }

  resetAddMemberForm(): void {
    this.selectedUserIds = [];
    this.searchText = '';
    this.filteredUsers = [...this.users];
  }

  resetManagerForm(): void {
    this.selectedManagerId = null;
    this.managerSearchText = '';
    this.filteredManagerUsers = [...this.managerUsers];
  }

  showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message
    });
  }

  showWarning(message: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Attention',
      text: message
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.manager-menu') && !target.closest('.menu-button')) {
      this.showManagerMenu = false;
    }
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}