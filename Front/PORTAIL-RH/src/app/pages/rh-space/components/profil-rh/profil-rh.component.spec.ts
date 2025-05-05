import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilRhComponent } from './profil-rh.component';

describe('ProfilRhComponent', () => {
  let component: ProfilRhComponent;
  let fixture: ComponentFixture<ProfilRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilRhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
