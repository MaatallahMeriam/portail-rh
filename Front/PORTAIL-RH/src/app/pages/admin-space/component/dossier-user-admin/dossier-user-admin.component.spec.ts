import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierUserAdminComponent } from './dossier-user-admin.component';

describe('DossierUserAdminComponent', () => {
  let component: DossierUserAdminComponent;
  let fixture: ComponentFixture<DossierUserAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierUserAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierUserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
