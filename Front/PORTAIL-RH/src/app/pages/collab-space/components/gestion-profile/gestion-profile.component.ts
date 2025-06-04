import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar-collab/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UserService, UserDTO, UserUpdateBasicDTO } from '../../../../services/users.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { FileService } from '../../../../services/file.service';
import { DemandeService, UserDemandeDetailsDTO } from '../../../../services/demande.service';
import { CompetenceService, EmployeCompetenceDTO } from '../../../../services/competence.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';

interface Skill {
  name: string;
  level: 'Débutant' | 'Intermédiaire' | 'Expert';
}

@Component({
  selector: 'app-gestion-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './gestion-profile.component.html',
  styleUrls: ['./gestion-profile.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class GestionProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInputCV') fileInputCV?: ElementRef;
  @ViewChild('fileInputDiplome') fileInputDiplome?: ElementRef;
  @ViewChild('fileInputContrat') fileInputContrat?: ElementRef;

  user: UserDTO = {
    id: 0,
    userName: '',
    nom: '',
    prenom: '',
    mail: '',
    dateNaissance: '',
    age: 0,
    poste: '',
    departement: '',
    role: '',
    image: '',
    dossierId: 0,
    active: true,
    numero: '',
    adresse: '',
    showDropdown: false,
    checked: false
  };

  profilePicture: string = 'assets/icons/user-login-icon-14.png';
  newProfilePhotoFile: File | null = null;
  userId: number | null = null;
  dossierId: number | null = null;
  editingField: keyof UserUpdateBasicDTO | null = null;
  editingValue: string = '';
  showSaveAnimation: boolean = false;
  activeTab: 'personal' | 'dossier' | 'password' | 'skills' = 'personal';
  showAttachForm: string | null = null;
  selectedDossierFile: File | null = null;
  userDemandeDetails: UserDemandeDetailsDTO[] = [];
  isSidebarCollapsed = false;
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Variables pour la gestion des compétences
  skills: Skill[] = [];
  showSkillDialog = false;
  newSkillName = '';
  newSkillLevel: 'Débutant' | 'Intermédiaire' | 'Expert' = 'Débutant';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fileService: FileService,
    private demandeService: DemandeService,
    private competenceService: CompetenceService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      console.error('No authenticated user found');
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non authentifié.',
      });
      return;
    }

    this.loadUserDetails(this.userId);
    this.loadUserDemandeDetails(this.userId);
    this.loadUserCompetences(this.userId);
  }

  private loadUserCompetences(userId: number): void {
    this.competenceService.getCompetencesByEmploye(userId).subscribe({
      next: (competences: EmployeCompetenceDTO[]) => {
        this.skills = competences.map(competence => ({
          name: competence.competenceNom, // Plus de competenceId, on utilise competenceNom
          level: competence.niveau as 'Débutant' | 'Intermédiaire' | 'Expert'
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des compétences:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les compétences.',
        });
      }
    });
  }

  openSkillDialog(): void {
    this.showSkillDialog = true;
    this.newSkillName = '';
    this.newSkillLevel = 'Débutant';
  }

  closeSkillDialog(): void {
    this.showSkillDialog = false;
  }

  addSkill(): void {
    if (!this.userId || !this.newSkillName || !this.newSkillLevel) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs.',
      });
      return;
    }

    const employeCompetenceDTO: EmployeCompetenceDTO = {
      employeId: this.userId,
      competenceNom: this.newSkillName,
      niveau: this.newSkillLevel
    };

    this.competenceService.addEmployeCompetence(employeCompetenceDTO).subscribe({
      next: (response: EmployeCompetenceDTO) => {
        this.skills.push({
          name: response.competenceNom,
          level: response.niveau as 'Débutant' | 'Intermédiaire' | 'Expert'
        });
        this.closeSkillDialog();
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Compétence ajoutée avec succès.',
        });
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de la compétence:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible d\'ajouter la compétence.',
        });
      }
    });
  }

  getStars(level: 'Débutant' | 'Intermédiaire' | 'Expert'): boolean[] {
    switch (level) {
      case 'Débutant':
        return [true, false, false];
      case 'Intermédiaire':
        return [true, true, false];
      case 'Expert':
        return [true, true, true];
      default:
        return [false, false, false];
    }
  }

  triggerProfilePictureInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('No file input found for profile picture');
    }
  }

  resetPasswordFields(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  updatePassword(): void {
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non authentifié.',
      });
      return;
    }

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Tous les champs sont requis.',
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les nouveaux mots de passe ne correspondent pas.',
      });
      return;
    }

    this.userService.updatePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
      next: (response: string) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: response,
        });
        this.resetPasswordFields();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du mot de passe:', err);
      }
    });
  }

  loadUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (userData: UserDTO) => {
        this.user = {
          ...userData,
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          userName: userData.userName || '',
          dateNaissance: userData.dateNaissance || '',
          numero: userData.numero || '',
          mail: userData.mail || '',
          adresse: userData.adresse || '',
          image: userData.image || ''
        };
        this.dossierId = userData.dossierId || null;
        this.updateProfilePicture(userData.image);
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les détails de l\'utilisateur.',
        });
      }
    });
  }

  deleteProfilePhoto(): void {
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non authentifié.',
      });
      return;
    }

    Swal.fire({
      title: 'Voulez-vous vraiment supprimer votre photo de profil ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteProfilePhoto(this.userId!).subscribe({
          next: (updatedUser: UserDTO) => {
            this.user = updatedUser;
            this.updateProfilePicture(updatedUser.image);
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Photo de profil supprimée avec succès.',
            });
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de la photo de profil:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de supprimer la photo de profil.',
            });
          }
        });
      }
    });
  }

  loadUserDemandeDetails(userId: number): void {
    this.demandeService.getUserDemandeDetails(userId).subscribe({
      next: (demandes: UserDemandeDetailsDTO[]) => {
        this.userDemandeDetails = demandes;
      },
      error: (err) => {
        console.error('Error fetching user demande details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger l\'historique des demandes.',
        });
      }
    });
  }

  private updateProfilePicture(imagePath: string | null | undefined): void {
    const url = this.getImageUrl(imagePath);
    this.profilePicture = url;

    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', url);
    };
    img.onerror = () => {
      console.error('Failed to load image:', url);
      this.profilePicture = 'assets/icons/user-login-icon-14.png';
      Swal.fire({
        icon: 'warning',
        title: 'Erreur',
        text: 'Impossible de charger l\'image de profil. Utilisation de l\'image par défaut.',
      });
    };
    img.src = url;
  }

  private getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return 'assets/icons/user-login-icon-14.png';
    }

    if (imagePath.startsWith('http://localhost:8080/')) {
      return imagePath;
    }

    return `http://localhost:8080/${imagePath.replace(/\\/g, '/')}`;
  }

  triggerFileInput(fileType: string): void {
    let fileInput: ElementRef | undefined;
    switch (fileType) {
      case 'cv':
        fileInput = this.fileInputCV;
        break;
      case 'diplome':
        fileInput = this.fileInputDiplome;
        break;
      case 'contrat':
        fileInput = this.fileInputContrat;
        break;
      default:
        return;
    }
    if (fileInput && fileInput.nativeElement) {
      fileInput.nativeElement.click();
    } else {
      console.error(`No file input found for fileType: ${fileType}`);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.userId) {
      const file = input.files[0];
      this.newProfilePhotoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicture = e.target?.result as string;
        this.showSaveAnimation = true;
        this.userService.uploadProfilePhoto(this.userId!, file).subscribe({
          next: (updatedUser: UserDTO) => {
            this.user = updatedUser;
            this.updateProfilePicture(updatedUser.image);
            this.showSaveAnimation = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Photo de profil mise à jour avec succès.',
            });
          },
          error: (err) => {
            console.error('Error uploading profile photo:', err);
            this.showSaveAnimation = false;
            this.updateProfilePicture(this.user.image);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de mettre à jour la photo de profil.',
            });
          }
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.newProfilePhotoFile = null;
      this.updateProfilePicture(this.user.image);
    }
  }

  fieldDisplayName(field: keyof UserDTO): string {
    const fieldNames: { [key in keyof UserDTO]?: string } = {
      userName: 'Nom d\'utilisateur',
      nom: 'Nom',
      prenom: 'Prénom',
      mail: 'Email',
      dateNaissance: 'Date de naissance',
      numero: 'Numéro de téléphone',
      adresse: 'Adresse'
    };
    return fieldNames[field] || field;
  }

  editField(fieldName: keyof UserDTO): void {
    const validFields: (keyof UserUpdateBasicDTO)[] = ['userName', 'nom', 'prenom', 'mail', 'numero', 'dateNaissance', 'adresse'];
    if (!validFields.includes(fieldName as keyof UserUpdateBasicDTO)) {
      Swal.fire({
        icon: 'info',
        title: 'Mise à jour non disponible',
        text: `La modification de ${this.fieldDisplayName(fieldName)} n\'est pas prise en charge via cet écran. Veuillez contacter un administrateur.`,
      });
      return;
    }

    this.editingField = fieldName as keyof UserUpdateBasicDTO;
    if (fieldName === 'dateNaissance') {
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

    const updateData: UserUpdateBasicDTO = {};

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

    this.userService.updateUserBasicInfo(this.userId, updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.updateProfilePicture(updatedUser.image);
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

  @HostListener('document:click', ['$event'])
  closeAttachForm(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.edit-icon') && !target.closest('.attach-form')) {
      this.showAttachForm = null;
      this.selectedDossierFile = null;
    }
  }

  attachFile(fileType: string): void {
    this.showAttachForm = fileType;
    this.selectedDossierFile = null;
  }

  onDossierFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedDossierFile = input.files[0];
    }
  }

  submitFile(fileType: string): void {
    if (!this.dossierId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun dossier associé à cet utilisateur.',
      });
      return;
    }

    if (!this.selectedDossierFile) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un fichier.',
      });
      return;
    }

    this.fileService.uploadSingleFile(this.dossierId, fileType, this.selectedDossierFile).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Fichier ${fileType} uploadé avec succès.`,
        });
        this.showAttachForm = null;
        this.selectedDossierFile = null;
      },
      error: (error) => {
        console.error(`Erreur lors de l'upload du fichier ${fileType}`, error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: `Erreur lors de l'upload du fichier ${fileType}.`,
        });
        this.showAttachForm = null;
      }
    });
  }

  cancelAttach(): void {
    this.showAttachForm = null;
    this.selectedDossierFile = null;
  }

  downloadFile(fileType: string): void {
    if (!this.dossierId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun dossier associé à cet utilisateur.',
      });
      return;
    }

    this.fileService.downloadFile(this.dossierId, fileType).subscribe({
      next: (blob: Blob) => {
        if (blob.size === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Fichier non disponible',
            text: `Le fichier ${fileType} n'existe pas ou a été supprimé.`,
          });
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileType}_user_${this.userId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error(`Erreur lors du téléchargement du fichier ${fileType}`, error);
        Swal.fire({
          icon: 'info',
          title: 'Fichier non disponible',
          text: `Le fichier ${fileType} n'existe pas ou a été supprimé.`,
        });
      }
    });
  }

  deleteFile(fileType: string): void {
    if (!this.dossierId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun dossier associé à cet utilisateur.',
      });
      return;
    }

    Swal.fire({
      title: 'Voulez-vous vraiment supprimer ce fichier ?',
      text: `Vous allez supprimer le fichier ${fileType}. Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fileService.deleteSingleFile(this.dossierId!, fileType).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: `Fichier ${fileType} supprimé avec succès.`,
            });
          },
          error: (error) => {
            console.error(`Erreur lors de la suppression du fichier ${fileType}`, error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: `Erreur lors de la suppression du fichier ${fileType}.`,
            });
          }
        });
      }
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}