import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollabSpaceComponent } from './collab-space.component';

describe('CollabSpaceComponent', () => {
  let component: CollabSpaceComponent;
  let fixture: ComponentFixture<CollabSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollabSpaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollabSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
