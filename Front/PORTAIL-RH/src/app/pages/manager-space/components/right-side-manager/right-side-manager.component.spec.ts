import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightSideManagerComponent } from './right-side-manager.component';

describe('RightSideManagerComponent', () => {
  let component: RightSideManagerComponent;
  let fixture: ComponentFixture<RightSideManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightSideManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightSideManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
