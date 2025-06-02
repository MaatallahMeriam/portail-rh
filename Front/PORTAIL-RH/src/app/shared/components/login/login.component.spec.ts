import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Importez ceci pour les tests
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, // Ajoutez LoginComponent ici car il est standalone
        HttpClientTestingModule // Ajoutez ceci pour fournir HttpClient dans les tests
      ],
      providers: [AuthService] // AuthService peut maintenant accéder à HttpClient
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});