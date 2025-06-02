import { TestBed } from '@angular/core/testing';
import { DetailsIdeeComponent } from './details-idee.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicationService } from '../../../../services/publication.service'; // Adjust the path

describe('DetailsIdeeComponent', () => {
  let component: DetailsIdeeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Add this
      declarations: [DetailsIdeeComponent] // Remove if standalone
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailsIdeeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});