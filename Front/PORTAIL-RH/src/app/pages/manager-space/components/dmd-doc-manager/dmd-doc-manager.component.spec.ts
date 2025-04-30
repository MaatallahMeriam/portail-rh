import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmdDocManagerComponent } from './dmd-doc-manager.component';

describe('DmdDocManagerComponent', () => {
  let component: DmdDocManagerComponent;
  let fixture: ComponentFixture<DmdDocManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdDocManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdDocManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
