import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionNewsComponent } from './gestion-news.component';

describe('GestionNewsComponent', () => {
  let component: GestionNewsComponent;
  let fixture: ComponentFixture<GestionNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
