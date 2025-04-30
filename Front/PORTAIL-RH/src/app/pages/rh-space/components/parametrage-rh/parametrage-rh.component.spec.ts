import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageRhComponent } from './parametrage-rh.component';

describe('ParametrageRhComponent', () => {
  let component: ParametrageRhComponent;
  let fixture: ComponentFixture<ParametrageRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrageRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametrageRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
