import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsUserAdminComponent } from './details-user-admin.component';

describe('DetailsUserAdminComponent', () => {
  let component: DetailsUserAdminComponent;
  let fixture: ComponentFixture<DetailsUserAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsUserAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsUserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
