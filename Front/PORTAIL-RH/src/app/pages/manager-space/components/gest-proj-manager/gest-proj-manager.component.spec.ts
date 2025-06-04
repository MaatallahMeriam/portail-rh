import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestProjManagerComponent } from './gest-proj-manager.component';

describe('GestProjManagerComponent', () => {
  let component: GestProjManagerComponent;
  let fixture: ComponentFixture<GestProjManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestProjManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestProjManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
