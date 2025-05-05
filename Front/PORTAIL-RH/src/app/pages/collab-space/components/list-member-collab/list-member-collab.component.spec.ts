import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMemberCollabComponent } from './list-member-collab.component';

describe('ListMemberCollabComponent', () => {
  let component: ListMemberCollabComponent;
  let fixture: ComponentFixture<ListMemberCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMemberCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMemberCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
