import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeeManagerComponent } from './idee-manager.component';

describe('IdeeManagerComponent', () => {
  let component: IdeeManagerComponent;
  let fixture: ComponentFixture<IdeeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeeManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeeManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
