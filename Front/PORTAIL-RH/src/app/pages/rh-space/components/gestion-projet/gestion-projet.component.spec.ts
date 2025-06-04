import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProjetComponent } from './gestion-projet.component';

describe('GestionProjetComponent', () => {
  let component: GestionProjetComponent;
  let fixture: ComponentFixture<GestionProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProjetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
