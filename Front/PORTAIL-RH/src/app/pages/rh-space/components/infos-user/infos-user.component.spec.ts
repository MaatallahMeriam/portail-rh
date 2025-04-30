import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosUserComponent } from './infos-user.component';

describe('InfosUserComponent', () => {
  let component: InfosUserComponent;
  let fixture: ComponentFixture<InfosUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfosUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfosUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
