import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceDocManagerComponent } from './espace-doc-manager.component';

describe('EspaceDocManagerComponent', () => {
  let component: EspaceDocManagerComponent;
  let fixture: ComponentFixture<EspaceDocManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceDocManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspaceDocManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
