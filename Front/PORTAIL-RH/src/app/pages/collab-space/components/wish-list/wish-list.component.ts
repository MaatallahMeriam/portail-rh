import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar-collab/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, BirthdayWishDTO } from '../../../../services/users.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.scss']
})
export class WishListComponent implements OnInit {
  isSidebarCollapsed = false;
  wishes$: Observable<BirthdayWishDTO[]> = of([]);
  authenticatedUserId: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authenticatedUserId = this.authService.getUserIdFromToken();
    if (!this.authenticatedUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Vous devez être connecté pour voir vos souhaits d\'anniversaire.',
      });
      this.router.navigate(['/login']);
      return;
    }

    this.wishes$ = this.userService.getBirthdayWishes(this.authenticatedUserId).pipe(
      catchError((error) => {
        console.error('Erreur lors du chargement des souhaits d\'anniversaire', error);
        return of([]);
      })
    );
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}