import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoUserAdminComponent } from './info-user-admin.component';

describe('InfoUserAdminComponent', () => {
  let component: InfoUserAdminComponent;
  let fixture: ComponentFixture<InfoUserAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoUserAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoUserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
