import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CarritoService, CartResponse, CartItemResponse } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-overlay" [class.open]="isOpen" (click)="closeCart.emit()">
      <!-- Cart Drawer -->
      <div class="cart-drawer" (click)="$event.stopPropagation()">
        <div class="cart-header">
          <h2>Bolsa de Compras</h2>
          <button (click)="closeCart.emit()" class="close-btn">&times;</button>
        </div>

        <div class="cart-body">
          <div *ngIf="cart && cart.items.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p>Tu bolsa de compras está vacía.</p>
            <button (click)="closeCart.emit()" class="shop-now-btn">Comenzar a Comprar</button>
          </div>

          <div *ngIf="cart && cart.items.length > 0" class="cart-items">
            <article *ngFor="let item of cart.items" class="cart-item">
              <div class="item-info">
                <h4>{{ item.productoNombre }}</h4>
                <p class="variant-desc">Color: {{ item.color }} / Talla: {{ item.talla }}</p>
                <div class="qty-control">
                  <button (click)="updateQuantity(item, item.cantidad - 1)" class="qty-btn">-</button>
                  <span class="qty">{{ item.cantidad }}</span>
                  <button (click)="updateQuantity(item, item.cantidad + 1)" [disabled]="item.cantidad >= item.stockDisponible" class="qty-btn">+</button>
                </div>
              </div>
              <div class="item-price-actions">
                <span class="item-price">S/ {{ item.subtotal | number:'1.2-2' }}</span>
                <button (click)="removeItem(item)" class="remove-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="remove-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </div>

        <div class="cart-footer" *ngIf="cart && cart.items.length > 0">
          <div class="summary-line">
            <span>Subtotal</span>
            <span class="total-price">S/ {{ cart.total | number:'1.2-2' }}</span>
          </div>
          <p class="shipping-info">Envío calculado en el siguiente paso</p>
          <button (click)="goToCheckout()" class="checkout-btn">Procesar Compra</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 200;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .cart-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .cart-drawer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 400px;
      max-width: 100vw;
      background: var(--bg-surface);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .cart-overlay.open .cart-drawer {
      transform: translateX(0);
    }
    .cart-header {
      padding: 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cart-header h2 {
      font-size: 18px;
      font-weight: 700;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 32px;
      line-height: 1;
      cursor: pointer;
      color: var(--text-secondary);
      transition: var(--transition-fast);
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--text-muted);
    }
    .shop-now-btn {
      background: var(--primary-base);
      color: var(--bg-surface);
      border: none;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: var(--transition-fast);
      margin-top: 12px;
    }
    .shop-now-btn:hover {
      background: var(--primary-hover);
    }
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 24px;
    }
    .item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-info h4 {
      font-size: 15px;
      font-weight: 600;
    }
    .variant-desc {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .qty-control {
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 2px 8px;
      margin-top: 12px;
      gap: 8px;
      max-width: max-content;
    }
    .qty-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--text-secondary);
      transition: var(--transition-fast);
    }
    .qty-btn:hover:not([disabled]) {
      color: var(--text-primary);
    }
    .qty-btn:disabled {
      color: var(--text-muted);
      cursor: not-allowed;
    }
    .qty {
      font-size: 13px;
      font-weight: 700;
      min-width: 16px;
      text-align: center;
    }
    .item-price-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;
    }
    .item-price {
      font-size: 14px;
      font-weight: 700;
    }
    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      transition: var(--transition-fast);
      padding: 4px;
      border-radius: var(--radius-full);
    }
    .remove-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }
    .remove-icon {
      width: 18px;
      height: 18px;
    }
    .cart-footer {
      padding: 24px;
      border-top: 1px solid var(--border-color);
      background: var(--bg-card);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .total-price {
      font-size: 18px;
      font-weight: 800;
      color: var(--accent-base);
    }
    .shipping-info {
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    .checkout-btn {
      width: 100%;
      background: var(--primary-base);
      color: var(--bg-surface);
      border: none;
      padding: 16px;
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .checkout-btn:hover {
      background: var(--primary-hover);
    }
  `]
})
export class CarritoComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() closeCart = new EventEmitter<void>();

  cart: CartResponse | null = null;

  constructor(private carritoService: CarritoService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carritoService.cart$.subscribe(cartData => {
      this.cart = cartData;
      this.cdr.markForCheck();
    });
  }

  updateQuantity(item: CartItemResponse, newQuantity: number): void {
    const sesionId = this.carritoService.getSessionId();
    this.carritoService.updateItemQuantity(sesionId, item.varianteId, newQuantity).subscribe();
  }

  removeItem(item: CartItemResponse): void {
    const sesionId = this.carritoService.getSessionId();
    this.carritoService.removeItem(sesionId, item.varianteId).subscribe();
  }

  goToCheckout(): void {
    this.closeCart.emit();
    this.router.navigate(['/checkout']);
  }
}
