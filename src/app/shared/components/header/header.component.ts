import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService, CartResponse, CartItemResponse } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/" class="logo">Lumi</a>
        
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Colecciones</a>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Panel Admin</a>
        </nav>
        
        <div class="actions">
          <button (click)="openCart.emit()" class="cart-trigger">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span *ngIf="itemCount > 0" class="badge animate-pop">{{ itemCount }}</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      position: sticky;
      top: 0;
      z-index: 100;
      display: block;
    }
    .header {
      background: rgba(252, 251, 250, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      transition: var(--transition-smooth);
    }
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      height: 72px;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: var(--font-cursive);
      font-size: 38px;
      font-weight: 400;
      color: var(--text-primary);
      text-decoration: none;
    }
    .nav {
      display: flex;
      gap: 32px;
    }
    .nav a {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      transition: var(--transition-fast);
      position: relative;
      padding: 8px 0;
    }
    .nav a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--text-primary);
      transition: var(--transition-fast);
    }
    .nav a:hover {
      color: var(--text-primary);
    }
    .nav a:hover::after, .nav a.active::after {
      width: 100%;
    }
    .nav a.active {
      color: var(--text-primary);
      font-weight: 600;
    }
    .cart-trigger {
      background: none;
      border: none;
      cursor: pointer;
      position: relative;
      padding: 8px;
      color: var(--text-primary);
      border-radius: var(--radius-full);
      transition: var(--transition-fast);
    }
    .cart-trigger:hover {
      background: var(--bg-card);
    }
    .cart-trigger .icon {
      width: 24px;
      height: 24px;
    }
    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: var(--text-primary);
      color: var(--bg-surface);
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: var(--radius-full);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .animate-pop {
      animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() openCart = new EventEmitter<void>();
  itemCount: number = 0;

  constructor(private carritoService: CarritoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Listen to reactive cart changes
    this.carritoService.cart$.subscribe((cart: CartResponse | null) => {
      if (cart && cart.items) {
        this.itemCount = cart.items.reduce((sum: number, item: CartItemResponse) => sum + item.cantidad, 0);
      } else {
        this.itemCount = 0;
      }
      this.cdr.markForCheck();
    });

    // Initial load
    this.carritoService.refreshCart();
  }
}
