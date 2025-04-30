import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTeamFormComponent } from './edit-team-form.component';

describe('EditTeamFormComponent', () => {
  let component: EditTeamFormComponent;
  let fixture: ComponentFixture<EditTeamFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTeamFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTeamFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
