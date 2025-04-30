import { ComponentFixture, TestBed } from '@angular/core/testing';

import {DmdDocCollab } from './dmd-doc.component';

describe('DmdDocComponent', () => {
  let component:DmdDocCollab;
  let fixture: ComponentFixture<DmdDocCollab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmdDocCollab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmdDocCollab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
