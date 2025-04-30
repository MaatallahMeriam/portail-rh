// src/app/core/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    Swal.fire({
      icon: 'warning',
      title: 'Accès refusé',
      text: 'Veuillez vous connecter pour accéder à cette page.',
    });
    this.router.navigate(['/login']);
    return false;
  }
}