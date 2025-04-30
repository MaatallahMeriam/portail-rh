import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarManagerComponent } from './side-bar-manager.component';

describe('SideBarManagerComponent', () => {
  let component: SideBarManagerComponent;
  let fixture: ComponentFixture<SideBarManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
