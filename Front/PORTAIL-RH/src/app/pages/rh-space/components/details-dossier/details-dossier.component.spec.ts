import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDossierComponent } from './details-dossier.component';

describe('DetailsDossierComponent', () => {
  let component: DetailsDossierComponent;
  let fixture: ComponentFixture<DetailsDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsDossierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
