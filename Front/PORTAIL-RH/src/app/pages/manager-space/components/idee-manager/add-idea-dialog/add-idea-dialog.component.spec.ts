import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIdeaDialogComponent } from './add-idea-dialog.component';

describe('AddIdeaDialogComponent', () => {
  let component: AddIdeaDialogComponent;
  let fixture: ComponentFixture<AddIdeaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIdeaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIdeaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
