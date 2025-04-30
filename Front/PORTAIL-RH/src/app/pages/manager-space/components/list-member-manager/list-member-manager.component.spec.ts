import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMemberManagerComponent } from './list-member-manager.component';

describe('ListMemberManagerComponent', () => {
  let component: ListMemberManagerComponent;
  let fixture: ComponentFixture<ListMemberManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMemberManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMemberManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
