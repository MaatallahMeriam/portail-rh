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
      title: 'Gestion des Talents',
      description: 'Recrutez, développez et fidélisez les meilleurs talents pour votre entreprise.'
    },
    {
      icon: 'chart-line',
      title: 'Suivi de Performance',
      description: 'Évaluez et suivez la performance de vos équipes avec des outils avancés.'
    },
    {
      icon: 'calendar-check',
      title: 'Gestion des Congés',
      description: 'Simplifiez la gestion des congés et absences de vos collaborateurs.'
    },
    {
      icon: 'graduation-cap',
      title: 'Formation Continue',
      description: 'Développez les compétences de vos équipes avec des programmes personnalisés.'
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