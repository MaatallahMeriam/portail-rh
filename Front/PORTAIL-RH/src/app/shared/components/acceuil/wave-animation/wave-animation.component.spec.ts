import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveAnimationComponent } from './wave-animation.component';

describe('WaveAnimationComponent', () => {
  let component: WaveAnimationComponent;
  let fixture: ComponentFixture<WaveAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaveAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaveAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
