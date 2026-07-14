import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a routerLink="/" class="logo-back">← Tienda</a>
        <h3 class="title">LUMI ADMIN</h3>
      </div>
      
      <nav class="sidebar-nav">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
          Dashboard
        </a>
        <a routerLink="/admin/inventario" routerLinkActive="active" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Inventario
        </a>
        <a routerLink="/admin/ventas" routerLinkActive="active" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Ventas
        </a>
        <a routerLink="/admin/compras" routerLinkActive="active" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Compras
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <button (click)="logout()" class="logout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="nav-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--admin-bg-surface);
      border-right: 1px solid var(--admin-border-color);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      color: var(--admin-text-primary);
    }
    .sidebar-header {
      padding: 32px 24px;
      border-bottom: 1px solid var(--admin-border-color);
    }
    .logo-back {
      font-size: 12px;
      color: var(--admin-text-secondary);
      text-decoration: none;
      display: block;
      margin-bottom: 8px;
      transition: var(--transition-fast);
    }
    .logo-back:hover {
      color: var(--admin-text-primary);
    }
    .title {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .sidebar-nav {
      flex: 1;
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: var(--admin-text-secondary);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: var(--transition-fast);
    }
    .nav-item:hover, .nav-item.active {
      color: var(--admin-text-primary);
      background: var(--admin-bg-base);
    }
    .nav-item.active {
      border-left: 3px solid var(--admin-accent);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .nav-icon {
      width: 20px;
      height: 20px;
    }
    .sidebar-footer {
      padding: 24px 16px;
      border-top: 1px solid var(--admin-border-color);
    }
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: var(--transition-fast);
      text-align: left;
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1);
    }
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid var(--admin-border-color);
      }
      .sidebar-header {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        border-bottom: none;
      }
      .logo-back {
        margin-bottom: 0;
      }
      .sidebar-footer {
        position: absolute;
        top: 12px;
        right: 16px;
        padding: 0;
        border-top: none;
      }
      .logout-btn {
        padding: 8px 12px;
        font-size: 13px;
      }
      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding: 8px 16px;
        border-top: 1px solid var(--admin-border-color);
        gap: 8px;
        -webkit-overflow-scrolling: touch;
      }
      .sidebar-nav::-webkit-scrollbar {
        display: none;
      }
      .nav-item {
        padding: 8px 12px;
        font-size: 13px;
        white-space: nowrap;
        border-left: none !important;
        border-radius: var(--radius-md);
      }
      .nav-item.active {
        border-bottom: 3px solid var(--admin-accent);
        border-radius: 0;
        background: none;
      }
    }
  `]
})
export class AdminSidebarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
