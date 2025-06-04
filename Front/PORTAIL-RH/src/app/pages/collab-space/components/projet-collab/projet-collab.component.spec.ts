import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetCollabComponent } from './projet-collab.component';

describe('ProjetCollabComponent', () => {
  let component: ProjetCollabComponent;
  let fixture: ComponentFixture<ProjetCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
