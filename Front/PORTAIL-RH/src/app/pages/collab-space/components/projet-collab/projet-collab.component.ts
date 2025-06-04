import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar-collab/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetenceService, ProjetDTO } from '../../../../services/competence.service';
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projet-collab',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './projet-collab.component.html',
  styleUrls: ['./projet-collab.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjetCollabComponent implements OnInit {
  isSidebarCollapsed = false;
  userProjects: ProjetDTO[] = [];

  constructor(
    private competenceService: CompetenceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProjects();
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  loadUserProjects(): void {
    const userId = this.authService.getUserIdFromToken();
    if (userId !== null) {
      this.competenceService.getProjetsByEmploye(userId).subscribe({
        next: (projects) => {
          this.userProjects = projects;
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors du chargement des projets', 'error');
        }
      });
    } else {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      this.router.navigate(['/login']);
    }
  }

  viewProjectDetails(projectId: number): void {
  this.router.navigate(['/details-projet-collab'], { queryParams: { id: projectId } });
}
}