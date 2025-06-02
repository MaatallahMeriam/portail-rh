import { TestBed } from '@angular/core/testing';
import { TeamCardComponent } from './team-card.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

describe('TeamCardComponent', () => {
  let component: TeamCardComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule],
      declarations: [TeamCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Initialisation de l'Input 'equipe' avec un objet contenant 'departement'
    component.equipe = {
      id: 1,
      nom: 'Équipe Test',
      departement: 'Département Test',
      managerId: 1, // Correspond à EquipeDTO
      manager: {
        id: 1,
        prenom: 'Jean',
        nom: 'Dupont',
        userName: 'j.dupont',
        mail: 'jean.dupont@example.com',
        dateNaissance: '01/01/1990',      // Propriété requise
        age: 35,                          // Propriété requise
        poste: 'Manager',
        departement: 'Département Test',
        role: 'MANAGER',                  // Propriété requise
        image: 'assets/images/manager.jpg',
        numero: '123456789',
        active: true,                     // Propriété requise
        adresse: '123 Rue Exemple',       // Propriété requise
        showDropdown: false
      },
      showDropdown: false
    };
    
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});