import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeeCollabComponent } from './idee-collab.component';

describe('IdeeCollabComponent', () => {
  let component: IdeeCollabComponent;
  let fixture: ComponentFixture<IdeeCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeeCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeeCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
