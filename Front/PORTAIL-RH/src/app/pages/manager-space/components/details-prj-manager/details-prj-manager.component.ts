import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetenceService, ProjetDTO, MatchingResultDTO, ProjetAffectationDTO, EmployeCompetenceDTO } from '../../../../services/competence.service';
import { UserService, UserDTO } from '../../../../services/users.service'; // Ajouter UserService
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
@Component({
  selector: 'app-details-prj-manager',
  standalone: true,
  imports: [SideBarManagerComponent,
    HeaderComponent,
        MatIconModule,
        MatButtonModule,
        CommonModule,
        FormsModule

  ],
  templateUrl: './details-prj-manager.component.html',
  styleUrl: './details-prj-manager.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class DetailsPrjManagerComponent  implements OnInit {
  isSidebarCollapsed = false;
  projet: ProjetDTO | null = null;
  matchingResults: MatchingResultDTO[] = [];
  affectations: { employeId: number; user?: UserDTO; competences: EmployeCompetenceDTO[]; formattedCompetences: string }[] = [];
  allUsers: { user: UserDTO; competences: EmployeCompetenceDTO[]; formattedCompetences: string }[] = [];
  filteredUsers: { user: UserDTO; competences: EmployeCompetenceDTO[]; formattedCompetences: string }[] = [];
  searchQuery: string = '';
  isLoading = false;
  projetId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private competenceService: CompetenceService,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    this.projetId = id ? Number(id) : null;
    if (this.projetId && !isNaN(this.projetId) && this.projetId > 0) {
      this.loadProjetDetails();
      this.loadAffectations();
      this.loadAllUsers();
    } else {
      Swal.fire('Erreur', 'ID du projet invalide ou manquant', 'error');
      this.router.navigate(['/gestion-projet']);
    }
  }

  private formatCompetences(competences: EmployeCompetenceDTO[]): string {
    return competences.length > 0 ? competences.map(c => `${c.competenceNom} (${c.niveau})`).join(', ') : '';
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
                Promise.all(
                  employeIds.map(id =>
                    this.competenceService.getCompetencesByEmploye(id).toPromise()
                      .then(competences => ({
                        employeId: id,
                        user: users.find(user => user.id === id),
                        competences: competences || [],
                        formattedCompetences: this.formatCompetences(competences || [])
                      }))
                      .catch(() => ({
                        employeId: id,
                        user: users.find(user => user.id === id),
                        competences: [],
                        formattedCompetences: ''
                      }))
                  )
                ).then(affectationsWithCompetences => {
                  this.affectations = affectationsWithCompetences;
                });
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

  loadAllUsers(): void {
    this.userService.getAllActiveUsers().subscribe({
      next: (users) => {
        Promise.all(
          users.map(user =>
            this.competenceService.getCompetencesByEmploye(user.id).toPromise()
              .then(competences => ({
                user,
                competences: competences || [],
                formattedCompetences: this.formatCompetences(competences || [])
              }))
              .catch(() => ({
                user,
                competences: [],
                formattedCompetences: ''
              }))
          )
        ).then(usersWithCompetences => {
          this.allUsers = usersWithCompetences;
          this.filteredUsers = [...this.allUsers];
        });
      },
      error: (err) => {
        Swal.fire('Erreur', 'Erreur lors du chargement des utilisateurs', 'error');
      }
    });
  }

  filterUsers(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.competenceService.searchUsersByCompetence(this.searchQuery).subscribe({
        next: (users) => {
          Promise.all(
            users.map(user =>
              this.competenceService.getCompetencesByEmploye(user.id).toPromise()
                .then(competences => ({
                  user,
                  competences: competences || [],
                  formattedCompetences: this.formatCompetences(competences || [])
                }))
                .catch(() => ({
                  user,
                  competences: [],
                  formattedCompetences: ''
                }))
            )
          ).then(usersWithCompetences => {
            this.filteredUsers = usersWithCompetences;
          });
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors de la recherche par compétence', 'error');
          this.filteredUsers = [];
        }
      });
    }
  }

  isAffecte(employeId: number): boolean {
    return this.affectations.some(a => a.employeId === employeId);
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
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

  matchEmployes(): void {
    if (this.projetId) {
      this.isLoading = true;
      this.competenceService.matchEmployesToProjet(this.projetId).subscribe({
        next: (results) => {
          this.matchingResults = results;
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors du matching des employés', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  affecterEmploye(employeId: number): void {
    if (this.projetId) {
      const affectation: ProjetAffectationDTO = { projetId: this.projetId, employeId };
      this.competenceService.affecterEmployeAProjet(affectation).subscribe({
        next: () => {
          Swal.fire('Succès', 'Employé affecté au projet', 'success');
          this.loadAffectations();
          this.matchEmployes();
          this.filterUsers();
        },
        error: (err) => {
          Swal.fire('Erreur', 'Erreur lors de l’affectation de l’employé', 'error');
        }
      });
    }
  }

  desaffecterEmploye(employeId: number): void {
    if (this.projetId !== null) {
      Swal.fire({
        title: 'Confirmation',
        text: 'Êtes-vous sûr de vouloir désaffecter cet employé ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#230046',
        cancelButtonColor: '#ff4d4d',
        confirmButtonText: 'Oui, désaffecter',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.competenceService.desaffecterEmployeAProjet(this.projetId!, employeId).subscribe({
            next: () => {
              Swal.fire('Succès', 'Employé désaffecté du projet', 'success');
              this.loadAffectations();
              this.matchEmployes();
              this.filterUsers();
            },
            error: (err) => {
              Swal.fire('Erreur', 'Erreur lors de la désaffectation', 'error');
            }
          });
        }
      });
    } else {
      Swal.fire('Erreur', 'ID du projet manquant', 'error');
    }
  }
}