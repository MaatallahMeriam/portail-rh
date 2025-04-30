import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class RegisterComponent {
  userName: string = '';
  nom: string = '';
  prenom: string = '';
  mail: string = '';
  password: string = '';
  confirmPassword: string = '';
  dateNaissance: string = '';
  poste: string = '';
  departement: string = '';
  role: string = '';
  passwordMismatch: boolean = false;

  departementOptions = ['developpement', 'cloud', 'AI', 'IA', 'test'];
  roleOptions = ['RH', 'ADMIN', 'MANAGER', 'COLLAB'];

  constructor(private authService: AuthService, private router: Router) {}

  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }

  onRegister(): void {
    // Vérifier si les mots de passe correspondent
    this.passwordMismatch = this.password !== this.confirmPassword;
    if (this.passwordMismatch) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas. Veuillez réessayer.',
      });
      return;
    }

    const registerData = {
      userName: this.userName,
      nom: this.nom,
      prenom: this.prenom,
      mail: this.mail,
      password: this.password,
      dateNaissance: this.dateNaissance,
      poste: this.poste,
      departement: this.departement,
      role: this.role,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie',
          text: 'Votre compte a été créé avec succès !',
        }).then(() => {
          this.router.navigate(['/login']); // Rediriger vers la page de connexion
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.message || 'Une erreur est survenue lors de l\'inscription.',
        });
      }
    });
  }
}