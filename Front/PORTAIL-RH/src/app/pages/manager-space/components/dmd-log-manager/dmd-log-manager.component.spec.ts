import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmdLogManagerComponent } from './dmd-log-manager.component';

describe('DmdLogManagerComponent', () => {
  let component: DmdLogManagerComponent;
  let fixture: ComponentFixture<DmdLogManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdLogManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdLogManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
