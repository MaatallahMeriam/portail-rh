import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeCongesDialogComponent } from './demande-conges-dialog.component';

describe('DemandeCongesDialogComponent', () => {
  let component: DemandeCongesDialogComponent;
  let fixture: ComponentFixture<DemandeCongesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeCongesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeCongesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
