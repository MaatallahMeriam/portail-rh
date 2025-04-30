import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageAdminComponent } from './parametrage-admin.component';

describe('ParametrageAdminComponent', () => {
  let component: ParametrageAdminComponent;
  let fixture: ComponentFixture<ParametrageAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrageAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametrageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
