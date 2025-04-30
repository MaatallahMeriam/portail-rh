import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmdUserComponent } from './dmd-user.component';

describe('DmdUserComponent', () => {
  let component: DmdUserComponent;
  let fixture: ComponentFixture<DmdUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
