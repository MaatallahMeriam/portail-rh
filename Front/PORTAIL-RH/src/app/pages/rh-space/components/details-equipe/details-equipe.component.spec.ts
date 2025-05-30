import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEquipeComponent } from './details-equipe.component';

describe('DetailsEquipeComponent', () => {
  let component: DetailsEquipeComponent;
  let fixture: ComponentFixture<DetailsEquipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsEquipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsEquipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
