import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceDocCollabComponent } from './espace-doc-collab.component';

describe('EspaceDocCollabComponent', () => {
  let component: EspaceDocCollabComponent;
  let fixture: ComponentFixture<EspaceDocCollabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceDocCollabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspaceDocCollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
