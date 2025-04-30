import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPlanningsComponent } from './list-plannings.component';

describe('ListPlanningsComponent', () => {
  let component: ListPlanningsComponent;
  let fixture: ComponentFixture<ListPlanningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPlanningsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPlanningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
