import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMemberRhComponent } from './list-member-rh.component';

describe('ListMemberRhComponent', () => {
  let component: ListMemberRhComponent;
  let fixture: ComponentFixture<ListMemberRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMemberRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMemberRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
