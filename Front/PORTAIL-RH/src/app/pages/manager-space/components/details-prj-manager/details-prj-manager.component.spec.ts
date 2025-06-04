import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPrjManagerComponent } from './details-prj-manager.component';

describe('DetailsPrjManagerComponent', () => {
  let component: DetailsPrjManagerComponent;
  let fixture: ComponentFixture<DetailsPrjManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPrjManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPrjManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
