import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrPointageComponent } from './qr-pointage.component';

describe('QrPointageComponent', () => {
  let component: QrPointageComponent;
  let fixture: ComponentFixture<QrPointageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrPointageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrPointageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
