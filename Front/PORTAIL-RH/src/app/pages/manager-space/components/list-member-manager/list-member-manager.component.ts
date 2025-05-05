import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { EquipeService, TeamMemberDTO, EquipeDTO } from '../../../../services/equipe.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SideBarManagerComponent } from '../../components/side-bar-manager/side-bar-manager.component';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-member-manager',
  standalone: true,
  imports: [
    HeaderComponent,
    SideBarManagerComponent,
    CommonModule
  ],
  templateUrl: './list-member-manager.component.html',
  styleUrls: ['./list-member-manager.component.scss']
})
export class ListMemberManagerComponent implements OnInit {
  equipe: EquipeDTO | null = null;
  manager: UserDTO | null = null;
  teamMembers: TeamMemberDTO[] = [];
  isSidebarCollapsed: boolean = false;

  constructor(
    private authService: AuthService,
    private equipeService: EquipeService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      console.error('No user ID found, redirecting to login');
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non authentifié. Veuillez vous connecter.',
      }).then(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      });
      return;
    }

    // Fetch user details to get their equipeId
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (!user.equipeId) {
          Swal.fire({
            icon: 'warning',
            title: 'Aucune équipe',
            text: 'Vous n\'êtes assigné à aucune équipe.',
          });
          return;
        }

        // Fetch equipe details, manager, and team members
        forkJoin({
          equipe: this.equipeService.getEquipeById(user.equipeId),
          manager: this.equipeService.getManagerByEquipeId(user.equipeId),
          members: this.equipeService.getUsersByEquipeIdExcludingManager(user.equipeId)
        }).subscribe({
          next: ({ equipe, manager, members }) => {
            this.equipe = equipe;
            this.manager = manager;
            this.teamMembers = members.map(member => ({
              id: member.id,
              nom: member.nom,
              prenom: member.prenom,
              poste: member.poste,
              departement: member.departement,
              image: member.image,
              mail: member.mail,
              numero: member.numero // Include phone number
            }));
          },
          error: (error) => {
            console.error('Error fetching equipe details:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors du chargement des détails de l\'équipe.',
            });
          }
        });
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des informations utilisateur.',
        });
      }
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  getBackgroundImage(member: TeamMemberDTO | UserDTO): string {
    const imagePath = member.image ? member.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
    return `url(${imagePath})`;
  }

  navigateToMemberDetails(memberId: number): void {
    this.router.navigate(['/membre-equipe'], { queryParams: { memberId } });
  }
}