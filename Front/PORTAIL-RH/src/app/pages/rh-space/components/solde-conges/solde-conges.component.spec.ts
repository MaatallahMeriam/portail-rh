import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldeCongesComponent } from './solde-conges.component';

describe('SoldeCongesComponent', () => {
  let component: SoldeCongesComponent;
  let fixture: ComponentFixture<SoldeCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoldeCongesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoldeCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
