import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitDmdDetailsComponent } from './trait-dmd-details.component';

describe('TraitDmdDetailsComponent', () => {
  let component: TraitDmdDetailsComponent;
  let fixture: ComponentFixture<TraitDmdDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraitDmdDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraitDmdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
