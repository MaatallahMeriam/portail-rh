import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCongesComponent } from './gestion-conges.component';

describe('GestionCongesComponent', () => {
  let component: GestionCongesComponent;
  let fixture: ComponentFixture<GestionCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCongesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
