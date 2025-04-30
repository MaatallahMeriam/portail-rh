import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDossierComponent } from './gestion-dossier.component';

describe('GestionDossierComponent', () => {
  let component: GestionDossierComponent;
  let fixture: ComponentFixture<GestionDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionDossierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
