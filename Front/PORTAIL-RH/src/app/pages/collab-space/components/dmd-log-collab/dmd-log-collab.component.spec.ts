import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmdLogCollabComponent } from './dmd-log-collab.component';

describe('DmdLogCollabComponent', () => {
  let component: DmdLogCollabComponent;
  let fixture: ComponentFixture<DmdLogCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdLogCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdLogCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
