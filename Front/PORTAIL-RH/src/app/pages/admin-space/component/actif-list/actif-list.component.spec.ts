import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActifListComponent } from './actif-list.component';

describe('ActifListComponent', () => {
  let component: ActifListComponent;
  let fixture: ComponentFixture<ActifListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActifListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActifListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
