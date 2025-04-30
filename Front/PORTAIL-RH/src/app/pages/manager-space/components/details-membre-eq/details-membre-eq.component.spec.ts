import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsMembreEqComponent } from './details-membre-eq.component';

describe('DetailsMembreEqComponent', () => {
  let component: DetailsMembreEqComponent;
  let fixture: ComponentFixture<DetailsMembreEqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsMembreEqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsMembreEqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
