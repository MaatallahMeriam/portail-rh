import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoDmdCongesComponent } from './histo-dmd-conges.component';

describe('HistoDmdCongesComponent', () => {
  let component: HistoDmdCongesComponent;
  let fixture: ComponentFixture<HistoDmdCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoDmdCongesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoDmdCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
