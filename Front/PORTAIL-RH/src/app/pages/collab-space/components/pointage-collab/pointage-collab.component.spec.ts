import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointageCollabComponent } from './pointage-collab.component';

describe('PointageCollabComponent', () => {
  let component: PointageCollabComponent;
  let fixture: ComponentFixture<PointageCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointageCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointageCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
