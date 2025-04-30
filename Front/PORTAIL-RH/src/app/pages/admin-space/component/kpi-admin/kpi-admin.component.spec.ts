import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiAdminComponent } from './kpi-admin.component';

describe('KpiAdminComponent', () => {
  let component: KpiAdminComponent;
  let fixture: ComponentFixture<KpiAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
