import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, UserDTO, UserUpdateFullDTO } from '../../../../services/users.service';
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
  editingField: keyof UserUpdateFullDTO | 'password' | null = null; // Updated to include 'password'
  editingValue: string = '';
  isSidebarCollapsed = false;

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

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
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

  fieldDisplayName(field: keyof UserUpdateFullDTO | 'password'): string {
    const fieldNames: { [key in keyof UserUpdateFullDTO | 'password']?: string } = {
      userName: 'Nom d\'utilisateur',
      nom: 'Nom',
      prenom: 'Prénom',
      mail: 'Email',
      departement: 'Département',
      poste: 'Poste',
      role: 'Rôle',
      dateNaissance: 'Date de naissance',
      numero: 'Numéro de téléphone',
      password: 'Mot de passe',
    };
    return fieldNames[field] || field;
  }

  editField(fieldName: keyof UserUpdateFullDTO | 'password'): void {
    const validFields: (keyof UserUpdateFullDTO)[] = ['userName', 'nom', 'prenom', 'mail', 'numero', 'dateNaissance', 'poste', 'departement', 'role'];
    if (!validFields.includes(fieldName as keyof UserUpdateFullDTO) && fieldName !== 'password') {
      Swal.fire({
        icon: 'info',
        title: 'Mise à jour non disponible',
        text: `La modification de ${this.fieldDisplayName(fieldName)} n'est pas prise en charge via cet écran.`,
      });
      return;
    }

    this.editingField = fieldName;
    if (fieldName === 'dateNaissance') {
      if (this.user?.dateNaissance) {
        const [day, month, year] = this.user.dateNaissance.split('/');
        this.editingValue = `${year}-${month}-${day}`;
      } else {
        this.editingValue = '';
      }
    } else if (fieldName === 'password') {
      this.editingValue = ''; // Password field starts empty
    } else {
      this.editingValue = this.user?.[fieldName as keyof UserDTO]?.toString() || '';
    }
  }

  saveEdit(): void {
    if (!this.user || !this.editingField || !this.userId) return;

    if (this.editingField === 'password') {
      this.userService.modifierPassword(this.userId!, this.editingValue).subscribe({
        next: (message) => {
          this.editingField = null;
          this.editingValue = '';
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: message,
          });
        },
        error: (err) => {
          console.error('Erreur lors de la modification du mot de passe:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Impossible de modifier le mot de passe.',
          });
        }
      });
      return;
    }

    const updateData: UserUpdateFullDTO = {};

    if (this.editingField === 'dateNaissance') {
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

    this.userService.updateUserFullInfo(this.userId, updateData).subscribe({
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