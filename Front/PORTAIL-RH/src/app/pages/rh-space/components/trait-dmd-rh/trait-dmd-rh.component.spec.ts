import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraitDmdRhComponent } from './trait-dmd-rh.component';

describe('TraitDmdRhComponent', () => {
  let component: TraitDmdRhComponent;
  let fixture: ComponentFixture<TraitDmdRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraitDmdRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraitDmdRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
