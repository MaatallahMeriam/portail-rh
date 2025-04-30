import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningTtComponent } from './planning-tt.component';

describe('PlanningTtComponent', () => {
  let component: PlanningTtComponent;
  let fixture: ComponentFixture<PlanningTtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningTtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningTtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
