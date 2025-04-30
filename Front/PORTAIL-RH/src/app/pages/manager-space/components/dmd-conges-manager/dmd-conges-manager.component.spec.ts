import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmdCongesManagerComponent } from './dmd-conges-manager.component';

describe('DmdCongesManagerComponent', () => {
  let component: DmdCongesManagerComponent;
  let fixture: ComponentFixture<DmdCongesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdCongesManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdCongesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
