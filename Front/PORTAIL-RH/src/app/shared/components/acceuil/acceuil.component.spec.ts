import { TestBed } from '@angular/core/testing';
import { AcceuilComponent } from './acceuil.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FeatureCardComponent } from './feature-card/feature-card.component';
import { AnimatedCounterComponent } from './animated-counter/animated-counter.component';
import { WaveAnimationComponent } from './wave-animation/wave-animation.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing'; // Pour simuler Router

describe('AcceuilComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AcceuilComponent, // Ajoutez AcceuilComponent ici car il est standalone
        BrowserAnimationsModule, // Pour les animations
        FeatureCardComponent, // Importez les composants enfants standalone
        AnimatedCounterComponent,
        WaveAnimationComponent,
        CommonModule, // Pour les directives comme *ngIf
        RouterTestingModule // Pour simuler le Router
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AcceuilComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});