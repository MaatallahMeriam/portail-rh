
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetenceService, ProjetDTO } from '../../../../services/competence.service';
import { MatDialog } from '@angular/material/dialog';
import { AddProjetDialogComponent } from './add-projet-dialog/add-projet-dialog.component';
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gest-proj-manager',
  standalone: true,
  imports: [
    HeaderComponent,
    SideBarManagerComponent,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './gest-proj-manager.component.html',
  styleUrl: './gest-proj-manager.component.scss'
})
export class GestProjManagerComponent implements OnInit {
  userId: string | null = null;
  projets: ProjetDTO[] = [];
  isSidebarCollapsed = false;
  isLoading = true;

  constructor(
    private router: Router,
    private competenceService: CompetenceService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken()?.toString() || null;
    if (!this.userId) {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      this.isLoading = false;
      return;
    }
    this.loadProjets();
  }

  loadProjets(): void {
    this.isLoading = true;
    this.competenceService.getAllProjets().subscribe({
      next: (data) => {
        this.projets = data;
        this.isLoading = false;
      },
      error: (err) => {
        Swal.fire('Erreur', 'Erreur lors du chargement des projets', 'error');
        this.isLoading = false;
      }
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  openAddProjetDialog(): void {
    const dialogRef = this.dialog.open(AddProjetDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjets(); // Recharger les projets après ajout
      }
    });
  }

  downloadCahierCharge(projetId: number): void {
    if (!projetId) {
      Swal.fire('Erreur', 'ID du projet manquant', 'error');
      return;
    }
    this.competenceService.downloadCahierCharge(projetId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cahier_de_charge_${projetId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        Swal.fire('Erreur', 'Erreur lors du téléchargement du cahier de charges', 'error');
      }
    });
  }

  navigateToDetails(projetId: number): void {
    this.router.navigate(['/details-prj-manager'], { queryParams: { id: projetId } });
  }

  deleteProjet(projetId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action supprimera définitivement le projet et toutes ses affectations !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.competenceService.deleteProjet(projetId).subscribe({
          next: () => {
            Swal.fire('Succès', 'Projet supprimé avec succès', 'success');
            this.projets = this.projets.filter(projet => projet.id !== projetId); // Mettre à jour la liste
          },
          error: (err) => {
            Swal.fire('Erreur', 'Erreur lors de la suppression du projet', 'error');
          }
        });
      }
    });
  }
}
