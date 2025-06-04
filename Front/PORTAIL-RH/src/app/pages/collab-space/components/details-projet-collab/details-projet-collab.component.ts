import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar-collab/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetenceService, ProjetDTO, ProjetAffectationDTO } from '../../../../services/competence.service';
import { UserService, UserDTO } from '../../../../services/users.service'; // Ajouter UserService
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details-projet-collab',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './details-projet-collab.component.html',
  styleUrls: ['./details-projet-collab.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailsProjetCollabComponent implements OnInit {
  isSidebarCollapsed = false;
  projet: ProjetDTO | null = null;
  affectations: { employeId: number; user?: UserDTO }[] = [];
  projetId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private competenceService: CompetenceService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du projet depuis les query params
    const id = this.route.snapshot.queryParamMap.get('id');
    this.projetId = id ? Number(id) : null;
    if (this.projetId && !isNaN(this.projetId) && this.projetId > 0) {
      this.loadProjetDetails();
      this.loadAffectations();
    } else {
      Swal.fire('Erreur', 'ID du projet invalide ou manquant', 'error');
      this.router.navigate(['/projet-collab']);
    }
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  loadProjetDetails(): void {
    if (this.projetId) {
      this.competenceService.getProjetById(this.projetId).subscribe({
        next: (data) => {
          this.projet = data;
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors du chargement des détails du projet', 'error');
        }
      });
    }
  }

  loadAffectations(): void {
    if (this.projetId) {
      this.competenceService.getAffectationsByProjet(this.projetId).subscribe({
        next: (affectations) => {
          const employeIds = affectations.map(a => a.employeId);
          if (employeIds.length > 0) {
            this.userService.getAllUsers().subscribe({
              next: (users) => {
                this.affectations = affectations.map(affectation => ({
                  employeId: affectation.employeId,
                  user: users.find(user => user.id === affectation.employeId)
                }));
              },
              error: (err) => {
                Swal.fire('Erreur', 'Erreur lors du chargement des utilisateurs affectés', 'error');
              }
            });
          } else {
            this.affectations = [];
          }
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors du chargement des affectations', 'error');
        }
      });
    }
  }

  downloadCahierCharge(): void {
    if (this.projet?.id) {
      this.competenceService.downloadCahierCharge(this.projet.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cahier_de_charge_${this.projet?.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors du téléchargement du cahier de charges', 'error');
        }
      });
    }
  }
}