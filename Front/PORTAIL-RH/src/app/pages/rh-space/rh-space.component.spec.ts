import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RhSpaceComponent } from './rh-space.component';

describe('RhSpaceComponent', () => {
  let component: RhSpaceComponent;
  let fixture: ComponentFixture<RhSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RhSpaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RhSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
