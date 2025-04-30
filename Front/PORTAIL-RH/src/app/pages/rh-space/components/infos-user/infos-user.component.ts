import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, UserDTO } from '../../../../services/users.service';
import { FileService } from '../../../../services/file.service';
import { MatIconModule } from '@angular/material/icon';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-infos-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    RightSidebarComponent,
    MatIconModule
  ],
  templateUrl: './infos-user.component.html',
  styleUrls: ['./infos-user.component.scss']
})
export class InfosUserComponent implements OnInit {
  user: UserDTO | null = null;
  userId: number | null = null;
  dossierId: number | null = null;
  showBadgeMenu = false;
  editingField: keyof UserDTO | null = null;
  editingValue: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] ? +params['userId'] : null;
      if (this.userId) {
        this.loadUserDetails(this.userId);
      }
    });
  }

  loadUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user: UserDTO) => {
        this.user = user;
        this.dossierId = user.dossierId || null;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de l\'utilisateur', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les détails de l\'utilisateur.',
        });
      }
    });
  }

  toggleBadgeMenu(): void {
    this.showBadgeMenu = !this.showBadgeMenu;
  }

  @HostListener('document:click', ['$event'])
  closeMenus(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      this.showBadgeMenu = false;
    }
  }

  async exportBadge(): Promise<void> {
    const badgeElement = document.querySelector('.professional-badge') as HTMLElement;
    if (!badgeElement) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun badge trouvé à exporter.',
      });
      return;
    }

    try {
      const badgeClone = badgeElement.cloneNode(true) as HTMLElement;
      const badgeActions = badgeClone.querySelector('.badge-actions');
      if (badgeActions) {
        badgeActions.remove();
      }

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.appendChild(badgeClone);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(badgeClone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `badge_${this.user?.prenom}_${this.user?.nom}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Erreur lors de l\'export du badge:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible d\'exporter le badge.',
      });
    }
  }

  fieldDisplayName(field: keyof UserDTO): string {
    const fieldNames: { [key in keyof UserDTO]?: string } = {
      userName: 'Nom d\'utilisateur',
      nom: 'Nom',
      prenom: 'Prénom',
      mail: 'Email',
      departement: 'Département',
      poste: 'Poste',
      role: 'Rôle',
      dateNaissance: 'Date de naissance',
      numero: 'Numéro de téléphone',
      active: 'Statut'
    };
    return fieldNames[field] || field;
  }

  editField(fieldName: keyof UserDTO): void {
    this.editingField = fieldName;
    if (fieldName === 'active') {
      this.editingValue = this.user?.active ? 'true' : 'false';
    } else if (fieldName === 'dateNaissance') {
      // Convert DD/MM/YYYY to YYYY-MM-DD for the date input
      if (this.user?.dateNaissance) {
        const [day, month, year] = this.user.dateNaissance.split('/');
        this.editingValue = `${year}-${month}-${day}`;
      } else {
        this.editingValue = '';
      }
    } else {
      this.editingValue = this.user?.[fieldName]?.toString() || '';
    }
  }

  saveEdit(): void {
    if (!this.user || !this.editingField || !this.userId) return;

    let updateData: Partial<UserDTO> = {};

    if (this.editingField === 'active') {
      updateData[this.editingField] = this.editingValue === 'true';
    } else if (this.editingField === 'dateNaissance') {
      try {
        const date = new Date(this.editingValue);
        if (isNaN(date.getTime())) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Format de date invalide. Utilisez AAAA-MM-JJ.',
          });
          return;
        }
        // Convert back to DD/MM/YYYY format for the backend
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        updateData.dateNaissance = `${day}/${month}/${year}`;
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Format de date invalide. Utilisez AAAA-MM-JJ.',
        });
        return;
      }
    } else {
      updateData[this.editingField] = this.editingValue;
    }

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.editingField = null;
        this.editingValue = '';
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Modification enregistrée avec succès.',
        });
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de modifier les informations.',
        });
      }
    });
  }

  cancelEdit(): void {
    this.editingField = null;
    this.editingValue = '';
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}