import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.6s ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent {
  usernameOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';
  isPasswordVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin(): void {
    const credentials = {
      mail: this.usernameOrEmail,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        const role = this.authService.getUserRole();
        
        switch (role) {
          case 'COLLAB':
            this.router.navigate(['/collab-space']);
            break;
          case 'RH':
            this.router.navigate(['/rh-space']);
            break;
          case 'MANAGER':
            this.router.navigate(['/manager-space']);
            break;
          case 'ADMIN':
            this.router.navigate(['/admin-space']);
            break;
          default:
            this.authService.logout();
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Rôle non reconnu. Veuillez contacter l administrateur.',
            });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: 'Veuillez Vérifier vos identifiants !',
        });
      },
    });
  }
}