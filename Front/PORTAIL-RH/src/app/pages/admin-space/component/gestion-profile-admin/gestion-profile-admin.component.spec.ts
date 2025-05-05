import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProfileAdminComponent } from './gestion-profile-admin.component';

describe('GestionProfileAdminComponent', () => {
  let component: GestionProfileAdminComponent;
  let fixture: ComponentFixture<GestionProfileAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProfileAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProfileAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
