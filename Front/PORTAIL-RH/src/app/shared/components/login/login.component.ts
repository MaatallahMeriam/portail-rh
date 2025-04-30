import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class LoginComponent {
 
  
  usernameOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}
  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
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
              text: 'Rôle non reconnu. Veuillez contacter l’administrateur.',
            });
        }
      },
      error: (err) => {
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: 'Veuillez Véfifier vos identifiant ! ',
        });
      },
    });
  }
}