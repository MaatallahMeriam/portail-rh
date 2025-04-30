import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningUserComponent } from './planning-user.component';

describe('PlanningUserComponent', () => {
  let component: PlanningUserComponent;
  let fixture: ComponentFixture<PlanningUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
