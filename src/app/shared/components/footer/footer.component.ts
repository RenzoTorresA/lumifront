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
          <h3 class="footer-logo">Lumi</h3>
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
          <div class="link-column">
            <h4>Contacto</h4>
            <a href="https://wa.me/51918413620?text=Hola!%20Me%20gustar%C3%ADa%20hacer%20una%20consulta%20sobre%20sus%20productos." target="_blank" class="social-link whatsapp">
              <span class="social-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon">
                  <path d="M12.031 2c-5.514 0-9.99 4.476-9.99 9.99 0 2.08.636 4.017 1.733 5.626L2.013 23l5.525-1.45c1.558.946 3.385 1.49 5.333 1.49 5.514 0 9.99-4.476 9.99-9.99S17.545 2 12.031 2zm0 1.662c4.582 0 8.328 3.74 8.328 8.328 0 4.582-3.74 8.328-8.328 8.328-1.785 0-3.44-.567-4.795-1.528l-.344-.244-3.262.856.872-3.181-.27-.43c-1.026-1.634-1.616-3.565-1.616-5.631 0-4.582 3.74-8.328 8.328-8.328zm-3.805 3.327c-.201 0-.43.08-.62.278-.201.201-.767.75-.767 1.831 0 1.08.788 2.126.9 2.277.11.151 1.543 2.355 3.738 3.303 2.195.947 2.195.63 2.595.592.4-.038 1.292-.527 1.472-1.033.18-.506.18-.94.126-1.033-.054-.092-.2-.15-.42-.26-.22-.11-1.292-.638-1.492-.71-.2-.072-.344-.11-.49.11-.144.22-.556.71-.68.854-.126.144-.251.162-.471.052-.22-.11-.929-.342-1.77-1.093-.655-.584-1.096-1.306-1.225-1.527-.128-.221-.013-.34.097-.45.099-.1.22-.26.33-.39.11-.13.144-.22.22-.366.076-.147.038-.275-.02-.385-.058-.11-.49-1.181-.67-1.62-.176-.424-.352-.366-.49-.373-.127-.006-.275-.008-.423-.008z"/>
                </svg>
              </span>
              WhatsApp
            </a>
            <a href="https://www.facebook.com/share/1G6e2FgMN2/" target="_blank" class="social-link facebook">
              <span class="social-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </span>
              Facebook
            </a>
            <h4 class="sub-heading">Horario</h4>
            <span class="schedule-text">Abierto 24/7 (Lunes a Domingo)</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Lumi. Todos los derechos reservados. Hecho con ❤️ para tu tienda.</p>
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
      font-family: var(--font-cursive);
      font-size: 38px;
      font-weight: 400;
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
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    @media (max-width: 600px) {
      .links-section {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
    .link-column h4 {
      font-family: var(--font-heading);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      color: #ffffff;
    }
    .link-column .sub-heading {
      margin-top: 24px;
    }
    .schedule-text {
      font-size: 14px;
      color: #a39f96;
      line-height: 1.5;
    }
    .link-column a {
      display: flex;
      align-items: center;
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
    .social-link {
      display: flex !important;
      align-items: center;
      gap: 12px;
      font-size: 15px !important;
      color: #eae7e0 !important;
      margin-bottom: 14px !important;
      text-decoration: none;
      transition: color 0.2s ease-in-out;
    }
    .social-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .social-link.whatsapp .social-icon-wrapper {
      background: #25D366;
      color: #ffffff;
    }
    .social-link.whatsapp:hover {
      color: #ffffff !important;
      text-shadow: 0 0 8px rgba(37, 211, 102, 0.3);
    }
    .social-link.whatsapp:hover .social-icon-wrapper {
      background: #20ba59;
      transform: translateY(-3px) scale(1.08);
      box-shadow: 0 6px 14px rgba(37, 211, 102, 0.4);
    }
    .social-link.facebook .social-icon-wrapper {
      background: #1877F2;
      color: #ffffff;
    }
    .social-link.facebook:hover {
      color: #ffffff !important;
      text-shadow: 0 0 8px rgba(24, 119, 242, 0.3);
    }
    .social-link.facebook:hover .social-icon-wrapper {
      background: #1565cd;
      transform: translateY(-3px) scale(1.08);
      box-shadow: 0 6px 14px rgba(24, 119, 242, 0.4);
    }
    .social-icon {
      width: 22px;
      height: 22px;
      fill: currentColor;
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
