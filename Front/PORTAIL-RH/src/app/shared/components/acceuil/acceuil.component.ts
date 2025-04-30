import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [],
  templateUrl: './acceuil.component.html',
  styleUrl: './acceuil.component.scss'
})
export class AcceuilComponent {
  constructor(private router: Router) {} 
  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }

}
