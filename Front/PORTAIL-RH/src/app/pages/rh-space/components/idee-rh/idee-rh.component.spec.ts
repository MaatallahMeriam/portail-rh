import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeeRhComponent } from './idee-rh.component';

describe('IdeeRhComponent', () => {
  let component: IdeeRhComponent;
  let fixture: ComponentFixture<IdeeRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeeRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeeRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
