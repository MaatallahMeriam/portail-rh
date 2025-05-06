import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsIdeeManagerComponent } from './details-idee-manager.component';

describe('DetailsIdeeManagerComponent', () => {
  let component: DetailsIdeeManagerComponent;
  let fixture: ComponentFixture<DetailsIdeeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsIdeeManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsIdeeManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
