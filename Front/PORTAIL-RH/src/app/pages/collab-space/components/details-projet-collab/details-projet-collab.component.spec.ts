import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsProjetCollabComponent } from './details-projet-collab.component';

describe('DetailsProjetCollabComponent', () => {
  let component: DetailsProjetCollabComponent;
  let fixture: ComponentFixture<DetailsProjetCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsProjetCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsProjetCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
