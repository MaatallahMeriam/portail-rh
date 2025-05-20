import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../services/auth.service';
import { UserService, BirthdayUser ,UserDTO} from '../../../services/users.service';
import { EquipeService,  } from '../../../services/equipe.service'; // Ajout du service EquipeService
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatDatepickerModule, CommonModule, FormsModule,MatIconModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightSidebarComponent implements OnInit {
  selected: Date = new Date();
  birthdayUsers$: Observable<BirthdayUser[]> = of([]);
  monthlyBirthdays$: Observable<BirthdayUser[]> = of([]); // Pour les anniversaires du mois
  authenticatedUserId: number | null = null;
  wishedUsers: Set<number> = new Set();
  teamManager: UserDTO | null = null; // Manager de l'équipe
  teamMembers: UserDTO[] = []; // Membres de l'équipe
  equipeId: number | null = null; // ID de l'équipe de l'utilisateur

  // Wish Modal State
  isWishModalOpen: boolean = false;
  selectedUser: BirthdayUser | null = null;
  wishMessage: string = '';
  icons: string[] = ['🎉', '🎂', '🎁', '🎈', '🥳', '🍾'];
  selectedIcon: string = '';
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private equipeService: EquipeService, // Ajout du service EquipeService
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authenticatedUserId = this.authService.getUserIdFromToken();
    if (!this.authenticatedUserId) {
      console.error('Utilisateur non authentifié ou ID non trouvé');
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Vous devez être connecté pour envoyer un souhait.',
      });
      this.router.navigate(['/login']);
      return;
    }

    // Initialiser les utilisateurs déjà souhaités
    this.initializeWishedUsers();

    // Charger les anniversaires du jour
    this.birthdayUsers$ = this.userService.getBirthdays().pipe(
      map(users => users.filter(user => user.isTodayBirthday)),
      catchError((error) => {
        console.error('Erreur lors du chargement des anniversaires', error);
        return of([]);
      })
    );

    // Charger les anniversaires du mois
    this.monthlyBirthdays$ = this.userService.getBirthdays().pipe(
      map(users => {
        const today = new Date();
        const currentMonth = today.getMonth();
        return users
          .filter(user => {
            const birthDate = new Date(user.birthdate.split('/').reverse().join('-')); // Convertir jj/mm en date
            return birthDate.getMonth() === currentMonth && !user.isTodayBirthday;
          })
          .sort((a, b) => {
            const dateA = new Date(a.birthdate.split('/').reverse().join('-')).getDate();
            const dateB = new Date(b.birthdate.split('/').reverse().join('-')).getDate();
            return dateA - dateB;
          })
          .slice(0, 3); // Prendre les 3 premiers
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement des anniversaires du mois', error);
        return of([]);
      })
    );

    // Charger les informations de l'équipe
    this.loadTeamInfo();
  }

  // Charger les informations de l'équipe
  loadTeamInfo(): void {
    this.userService.getUserById(this.authenticatedUserId!).subscribe({
      next: (user) => {
        this.equipeId = user.equipeId || null;
        if (this.equipeId) {
          // Charger le manager
          this.equipeService.getManagerByEquipeId(this.equipeId).subscribe({
            next: (manager) => {
              this.teamManager = manager;
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Erreur lors du chargement du manager', error);
            }
          });

          // Charger les membres (excluant le manager)
          this.equipeService.getUsersByEquipeIdExcludingManager(this.equipeId).subscribe({
            next: (members) => {
              this.teamMembers = members;
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Erreur lors du chargement des membres', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des informations de l\'utilisateur', error);
      }
    });
  }

  // Méthodes existantes inchangées
  initializeWishedUsers(): void {
    if (this.authenticatedUserId) {
      this.userService.getWishedUsersToday(this.authenticatedUserId).subscribe({
        next: (wishedUserIds: number[]) => {
          this.wishedUsers = new Set(wishedUserIds);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des utilisateurs souhaités', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les utilisateurs déjà souhaités.',
          });
        }
      });
    }
  }

  openWishModal(user: BirthdayUser): void {
    this.selectedUser = user;
    this.wishMessage = `Joyeux anniversaire ${user.fullName} ! 🎉 Passe une excellente journée !`;
    this.selectedIcon = '';
    this.selectedImage = null;
    this.selectedImagePreview = null;
    this.isWishModalOpen = true;
    this.cdr.markForCheck();
  }

  closeWishModal(): void {
    this.isWishModalOpen = false;
    this.selectedUser = null;
    this.wishMessage = '';
    this.selectedIcon = '';
    this.selectedImage = null;
    this.selectedImagePreview = null;
    this.cdr.markForCheck();
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.cdr.markForCheck();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = reader.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  sendWish(): void {
    if (!this.selectedUser) return;

    const userId = this.selectedUser.id;
    const wishData = {
      message: this.wishMessage,
      icon: this.selectedIcon,
      image: this.selectedImage
    };

    this.userService.wishHappyBirthday(userId, wishData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Souhait envoyé !',
          text: `Vous avez souhaité un joyeux anniversaire à ${this.selectedUser!.fullName} !`,
          timer: 1500,
          showConfirmButton: false,
        });

        this.wishedUsers.add(userId);
        this.closeWishModal();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du souhait d\'anniversaire', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'envoi du souhait.',
        });
      }
    });
  }

  wishHappyBirthday(user: BirthdayUser): void {
    this.userService.wishHappyBirthday(user.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Souhait envoyé !',
          text: `Vous avez souhaité un joyeux anniversaire à ${user.fullName} !`,
          timer: 1500,
          showConfirmButton: false,
        });
        this.wishedUsers.add(user.id);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du souhait d\'anniversaire', error);
      }
    });
  }

  hasWished(user: BirthdayUser): boolean {
    return this.wishedUsers.has(user.id);
  }

  logout(): void {
    Swal.fire({
      title: 'Voulez-vous vraiment vous déconnecter ?',
      text: 'Vous serez redirigé vers la page de connexion.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#56142F',
      cancelButtonColor: '#E91E63',
      confirmButtonText: 'Oui, déconnexion',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        Swal.fire({
          icon: 'success',
          title: 'Déconnexion réussie',
          text: 'Vous avez été déconnecté avec succès.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  navigateToWishes(): void {
    this.router.navigate(['/wishes-list']);
  }
}