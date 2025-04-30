import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../services/auth.service';
import { UserService, BirthdayUser } from '../../../services/users.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatDatepickerModule,CommonModule ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightSidebarComponent implements OnInit {
  selected: Date = new Date();
  birthdayUsers$: Observable<BirthdayUser[]> = of([]);
  authenticatedUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authenticatedUserId = this.authService.getUserIdFromToken();
    this.birthdayUsers$ = this.userService.getBirthdays().pipe(
      map(users => users.filter(user => user.isTodayBirthday)),
      catchError((error) => {
        console.error('Erreur lors du chargement des anniversaires', error);
        return of([]);
      })
    );
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