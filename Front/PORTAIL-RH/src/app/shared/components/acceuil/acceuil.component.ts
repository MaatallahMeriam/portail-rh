import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, style, animate, transition, stagger, query } from '@angular/animations';
import { FeatureCardComponent } from './feature-card/feature-card.component';
import { AnimatedCounterComponent } from './animated-counter/animated-counter.component';
import { WaveAnimationComponent } from './wave-animation/wave-animation.component';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [FeatureCardComponent, AnimatedCounterComponent, CommonModule, WaveAnimationComponent],
  templateUrl: './acceuil.component.html',
  styleUrl: './acceuil.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
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
export class AcceuilComponent implements OnInit {
  featureItems = [
  {
    icon: 'users',
    title: 'Gestion des Utilisateurs',
    description: 'Gérez les profils, rôles et interactions entre employés, RH et managers efficacement.'
  },
  {
    icon: 'chart-line',
    title: 'Suivi des Équipes',
    description: 'Suivez l’état de vos collaborateurs (congés, présence) et validez leurs demandes en temps réel.'
  },
  {
    icon: 'calendar-check',
    title: 'Gestion des Congés',
    description: 'Demandez, validez et suivez vos congés avec un aperçu clair de votre solde disponible.'
  },
  {
    icon: 'file-alt',
    title: 'Gestion des Documents',
    description: 'Accédez, téléchargez et gérez vos documents RH ou soumettez des demandes administratives.'
  }
];

  stats = [
    { label: 'Experts dévoués', value: 40 },
    { label: 'Ingénieurs qualifiés', value: 30 },
    { label: 'Capital social', value: '8,5M TND' },
    { label: 'Siège social', value: 'La Marsa' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Component initialization
  }

  navigateTo(route: string) {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }

  // Add this method to expose global isNaN
  isNaN(value: any): boolean {
    return isNaN(value);
  }
}