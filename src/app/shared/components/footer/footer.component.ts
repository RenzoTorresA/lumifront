import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="brand-section">
          <h3 class="footer-logo">LUMI</h3>
          <p class="description">Moda minimalista y sostenible, diseñada para durar.</p>
        </div>
        
        <div class="links-section">
          <div class="link-column">
            <h4>Colecciones</h4>
            <a>Nueva Temporada</a>
            <a>Casacas & Sacos</a>
            <a>Camisas & Polos</a>
          </div>
          <div class="link-column">
            <h4>Soporte</h4>
            <a>Preguntas Frecuentes</a>
            <a>Cambios & Devoluciones</a>
            <a>Políticas de Envío</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} LUMI. Todos los derechos reservados. Hecho con ❤️ para tu tienda.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #111111;
      color: #eae7e0;
      padding: 64px 24px 24px 24px;
      margin-top: auto;
      border-top: 1px solid #222222;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 48px;
      padding-bottom: 48px;
      border-bottom: 1px solid #222222;
    }
    @media (max-width: 768px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
    .footer-logo {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
      color: #ffffff;
    }
    .description {
      font-size: 14px;
      color: #a39f96;
      max-width: 280px;
    }
    .links-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    .link-column h4 {
      font-family: var(--font-heading);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      color: #ffffff;
    }
    .link-column a {
      display: block;
      font-size: 14px;
      color: #a39f96;
      text-decoration: none;
      margin-bottom: 10px;
      transition: var(--transition-fast);
      cursor: pointer;
    }
    .link-column a:hover {
      color: #ffffff;
    }
    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      padding-top: 24px;
      display: flex;
      justify-content: center;
      font-size: 12px;
      color: #6e6b64;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
