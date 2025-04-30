import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { EquipeService, TeamMemberDTO } from '../../../../services/equipe.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSideManagerComponent } from '../../components/right-side-manager/right-side-manager.component';
import { SideBarManagerComponent } from '../../components/side-bar-manager/side-bar-manager.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-member-manager',
  standalone: true,
  imports: [
    HeaderComponent,
    SideBarManagerComponent,
    RightSideManagerComponent,
    CommonModule
  ],
  templateUrl: './list-member-manager.component.html',
  styleUrl: './list-member-manager.component.scss'
})
export class ListMemberManagerComponent implements OnInit {
  teamMembers: TeamMemberDTO[] = [];

  constructor(
    private authService: AuthService,
    private equipeService: EquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const managerId = this.authService.getUserIdFromToken();
    if (!managerId) {
      console.error('No manager ID found, redirecting to login');
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

    // Fetch team members for the authenticated manager
    this.equipeService.getTeamMembersByManagerId(managerId).subscribe({
      next: (members) => {
        this.teamMembers = members;
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des membres de l\'équipe.',
        });
      }
    });
  }

  getBackgroundImage(member: TeamMemberDTO): string {
    const imagePath = member.image ? member.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
    return `url(${imagePath})`;
  }

  navigateToMemberDetails(memberId: number): void {
    this.router.navigate(['/membre-equipe'], { queryParams: { memberId } });
  }
}