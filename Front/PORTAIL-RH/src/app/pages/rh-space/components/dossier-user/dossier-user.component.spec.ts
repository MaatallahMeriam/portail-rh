import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierUserComponent } from './dossier-user.component';

describe('DossierUserComponent', () => {
  let component: DossierUserComponent;
  let fixture: ComponentFixture<DossierUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
