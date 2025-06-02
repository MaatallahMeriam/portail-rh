import { TestBed } from '@angular/core/testing';
import { DetailsDossierComponent } from './details-dossier.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DetailsDossierComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsDossierComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '1' }) } // Mock des paramètres de route
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DetailsDossierComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});