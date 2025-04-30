import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierListComponent } from './list-dossiers.component';

describe('ListDossiersComponent', () => {
  let component: DossierListComponent;
  let fixture: ComponentFixture<DossierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
