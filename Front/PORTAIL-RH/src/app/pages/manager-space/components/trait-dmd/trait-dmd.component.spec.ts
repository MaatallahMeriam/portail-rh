import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitDmdComponent } from './trait-dmd.component';

describe('TraitDmdComponent', () => {
  let component: TraitDmdComponent;
  let fixture: ComponentFixture<TraitDmdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraitDmdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraitDmdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
