import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { EquipeService, TeamMemberDTO } from '../../../../services/equipe.service';
import { Router } from '@angular/router';
import { UserService, BirthdayUser } from '../../../../services/users.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-right-side-manager',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatMenuModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './right-side-manager.component.html',
  styleUrl: './right-side-manager.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightSideManagerComponent implements OnInit {
  selected: Date = new Date();
  teamMembers: TeamMemberDTO[] = [];
  maxVisibleMembers: number = 3;
  birthdayUsers$: Observable<BirthdayUser[]> = of([]).pipe(startWith([])); // Initialize with empty array
  authenticatedUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private equipeService: EquipeService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const managerId = this.authService.getUserIdFromToken();
    this.authenticatedUserId = managerId; // Store the authenticated user's ID
    console.log('Manager ID from token:', managerId);
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

    // Fetch team members
    this.equipeService.getTeamMembersByManagerId(managerId).subscribe({
      next: (members) => {
        console.log('Team members received:', members);
        this.teamMembers = members;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
      }
    });

    // Fetch birthday users
    this.birthdayUsers$ = this.userService.getBirthdays().pipe(
      map(users => users.filter(user => user.isTodayBirthday)),
      catchError((error) => {
        console.error('Erreur lors du chargement des anniversaires', error);
        return of([]);
      }),
      startWith([]) // Ensure the Observable starts with an empty array
    );
  }

  getBackgroundImage(member: TeamMemberDTO): string {
    const imagePath = member.image ? member.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
    return `url(${imagePath})`;
  }

  navigateToTeamDetails(): void {
    this.router.navigate(['/details-eq']);
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
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du souhait d\'anniversaire', error);
      }
    });
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
}