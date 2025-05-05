import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilManagerComponent } from './profil-manager.component';

describe('ProfilManagerComponent', () => {
  let component: ProfilManagerComponent;
  let fixture: ComponentFixture<ProfilManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
