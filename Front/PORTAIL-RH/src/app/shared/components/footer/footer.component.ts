import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-copyright">
          © 2025 EXCELLIA Solutions. All rights reserved.
        </div>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: white;
      border-top: 1px solid var(--neutral-200);
      padding: var(--spacing-4) 0;
    }
    
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--spacing-5);
    }
    
    .footer-copyright {
      color: var(--neutral-600);
      font-size: 0.875rem;
    }
    
    .footer-links {
      display: flex;
      gap: var(--spacing-4);
    }
    
    .footer-links a {
      color: var(--neutral-600);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color var(--transition-fast);
    }
    
    .footer-links a:hover {
      color: var(--primary);
    }
    
    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
        gap: var(--spacing-3);
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}