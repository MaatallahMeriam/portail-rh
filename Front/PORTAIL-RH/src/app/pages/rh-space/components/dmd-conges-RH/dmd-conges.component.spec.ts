import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmdCongesComponent } from './dmd-conges.component';

describe('DmdCongesComponent', () => {
  let component: DmdCongesComponent;
  let fixture: ComponentFixture<DmdCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdCongesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
