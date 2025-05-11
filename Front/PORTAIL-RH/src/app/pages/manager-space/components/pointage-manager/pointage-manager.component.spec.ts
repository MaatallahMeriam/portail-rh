import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointageManagerComponent } from './pointage-manager.component';

describe('PointageManagerComponent', () => {
  let component: PointageManagerComponent;
  let fixture: ComponentFixture<PointageManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointageManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointageManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
