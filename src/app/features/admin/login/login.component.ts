import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card animate-fade-in">
        <a routerLink="/" class="back-shop">← Ir a la Tienda</a>
        <div class="logo">LUMI ADMIN</div>
        <p class="subtitle">Inicia sesión en el panel administrativo</p>
        
        <form (submit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" required placeholder="correo@ejemplo.com" />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required placeholder="••••••" />
          </div>

          <div class="error-msg" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading" class="login-btn">
            {{ loading ? 'Iniciando sesión...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      width: 100vw;
      height: 100vh;
      background: var(--admin-bg-base);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      color: var(--admin-text-primary);
    }
    .login-card {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-lg);
      padding: 48px 32px;
      max-width: 420px;
      width: 100%;
      position: relative;
      box-shadow: var(--shadow-lg);
    }
    .back-shop {
      font-size: 13px;
      color: var(--admin-text-secondary);
      text-decoration: none;
      transition: var(--transition-fast);
      display: block;
      margin-bottom: 24px;
    }
    .back-shop:hover {
      color: var(--admin-text-primary);
    }
    .logo {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-align: center;
      margin-bottom: 8px;
    }
    .subtitle {
      text-align: center;
      font-size: 14px;
      color: var(--admin-text-secondary);
      margin-bottom: 36px;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: var(--admin-text-secondary);
    }
    .form-group input {
      padding: 12px 16px;
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 14px;
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
      transition: var(--transition-fast);
    }
    .form-group input:focus {
      outline: none;
      border-color: var(--admin-accent);
    }
    .error-msg {
      color: #f87171;
      font-size: 13px;
      background: rgba(248, 113, 113, 0.1);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(248, 113, 113, 0.2);
    }
    .login-btn {
      background: var(--admin-accent);
      color: white;
      border: none;
      padding: 14px;
      font-weight: 600;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 14px;
      transition: var(--transition-fast);
      margin-top: 10px;
    }
    .login-btn:hover:not([disabled]) {
      background: var(--admin-accent-hover);
    }
    .login-btn:disabled {
      background: var(--admin-border-color);
      color: var(--admin-text-secondary);
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al iniciar sesión', err);
        this.error = 'Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.';
        this.cdr.markForCheck();
      }
    });
  }
}
