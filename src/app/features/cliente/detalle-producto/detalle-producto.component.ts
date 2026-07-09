import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, VarianteProducto } from '../../../core/services/producto.service';
import { CarritoService } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <main class="detalle-container animate-fade-in" *ngIf="producto">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a routerLink="/">Colecciones</a>
        <span>/</span>
        <span class="current">{{ producto.nombre }}</span>
      </nav>

      <div class="product-layout">
        <!-- Media Showcase -->
        <section class="media-section">
          <div class="img-wrapper">
            <img [src]="getActiveProductImage()" [alt]="producto.nombre" />
          </div>
        </section>

        <!-- Information & Configurations -->
        <section class="info-section">
          <h1 class="product-title">{{ producto.nombre }}</h1>
          <p class="price">S/ {{ producto.precioBase | number:'1.2-2' }}</p>
          <p class="description" *ngIf="producto.descripcion">{{ producto.descripcion }}</p>

          <!-- Configuration options -->
          <div class="config-panel">
            <!-- Colors -->
            <div class="option-group" *ngIf="colores.length > 0">
              <span class="option-label">Color</span>
              <div class="color-options">
                <button 
                  *ngFor="let col of colores" 
                  [class.active]="selectedColor === col"
                  (click)="selectColor(col)"
                  class="color-btn">
                  {{ col }}
                </button>
              </div>
            </div>

            <!-- Sizes -->
            <div class="option-group" *ngIf="tallas.length > 0">
              <span class="option-label">Talla</span>
              <div class="size-options">
                <button 
                  *ngFor="let tal of tallas" 
                  [class.active]="selectedSize === tal"
                  [disabled]="!isSizeAvailableForSelectedColor(tal)"
                  (click)="selectSize(tal)"
                  class="size-btn">
                  {{ tal }}
                </button>
              </div>
            </div>

            <!-- Quantity & Stock Details -->
            <div class="purchase-controls">
              <div class="quantity-wrapper">
                <span class="option-label">Cantidad</span>
                <div class="quantity-input">
                  <button (click)="decrementQuantity()" [disabled]="cantidad <= 1">-</button>
                  <span class="qty">{{ cantidad }}</span>
                  <button (click)="incrementQuantity()" [disabled]="cantidad >= maxStock">+</button>
                </div>
              </div>

              <!-- Inventory Status -->
              <div class="stock-status">
                <span *ngIf="selectedVariant" [class.low-stock]="selectedVariant.stock <= 5">
                  {{ selectedVariant.stock === 0 ? 'Sin existencias' : selectedVariant.stock + ' unidades disponibles' }}
                </span>
                <span *ngIf="!selectedVariant" class="status-placeholder">
                  Selecciona color y talla para verificar disponibilidad
                </span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="actions">
              <button 
                [disabled]="!selectedVariant || selectedVariant.stock === 0 || adding" 
                (click)="addToCart()"
                class="add-to-cart-btn"
                [class.success]="added">
                <span *ngIf="!adding && !added">Añadir al Carrito</span>
                <span *ngIf="adding">Añadiendo...</span>
                <span *ngIf="added">✓ ¡Añadido!</span>
              </button>
            </div>

            <div class="product-metadata">
              <p *ngIf="selectedVariant"><strong>SKU:</strong> {{ selectedVariant.sku }}</p>
              <p><strong>Envío:</strong> Disponible a nivel nacional</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div *ngIf="loading" class="loader-container">
      <span class="loader"></span>
    </div>
  `,
  styles: [`
    .detalle-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 24px;
    }
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
    .breadcrumb a {
      color: inherit;
      text-decoration: none;
      transition: var(--transition-fast);
    }
    .breadcrumb a:hover {
      color: var(--text-primary);
    }
    .breadcrumb .current {
      color: var(--text-primary);
      font-weight: 500;
    }
    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
    .media-section {
      width: 100%;
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      padding-top: 130%;
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .img-wrapper img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .product-title {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .price {
      font-size: 24px;
      font-weight: 800;
      color: var(--accent-base);
    }
    .description {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.7;
    }
    .config-panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
      border-top: 1px solid var(--border-color);
      padding-top: 24px;
    }
    .option-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .option-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }
    .color-options, .size-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .color-btn, .size-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 20px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .color-btn:hover:not([disabled]), .size-btn:hover:not([disabled]) {
      border-color: var(--text-primary);
    }
    .color-btn.active, .size-btn.active {
      background: var(--primary-base);
      color: var(--bg-surface);
      border-color: var(--primary-base);
    }
    .size-btn:disabled {
      color: var(--text-muted);
      border-color: var(--border-color);
      background: var(--bg-card);
      cursor: not-allowed;
      text-decoration: line-through;
    }
    .purchase-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card);
      padding: 16px 20px;
      border-radius: var(--radius-md);
      gap: 20px;
    }
    .quantity-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .quantity-input {
      display: flex;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      gap: 12px;
    }
    .quantity-input button {
      background: none;
      border: none;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--text-secondary);
      transition: var(--transition-fast);
    }
    .quantity-input button:hover:not([disabled]) {
      color: var(--text-primary);
    }
    .quantity-input button:disabled {
      color: var(--text-muted);
      cursor: not-allowed;
    }
    .qty {
      font-size: 14px;
      font-weight: 700;
      min-width: 20px;
      text-align: center;
    }
    .stock-status {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .low-stock {
      color: #d97706; /* low stock alert color */
    }
    .status-placeholder {
      font-weight: 400;
      color: var(--text-muted);
    }
    .add-to-cart-btn {
      width: 100%;
      background: var(--primary-base);
      color: var(--bg-surface);
      border: none;
      padding: 16px 24px;
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .add-to-cart-btn:hover:not([disabled]) {
      background: var(--primary-hover);
      transform: translateY(-2px);
    }
    .add-to-cart-btn:disabled {
      background: var(--text-muted);
      cursor: not-allowed;
    }
    .add-to-cart-btn.success {
      background: #10b981; /* green success */
    }
    .product-metadata {
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .loader-container {
      display: flex;
      justify-content: center;
      padding: 80px 0;
    }
    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-radius: 50%;
      border-top-color: var(--primary-base);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class DetalleProductoComponent implements OnInit {
  producto?: Producto;
  variantes: VarianteProducto[] = [];
  colores: string[] = [];
  tallas: string[] = [];

  selectedColor: string | null = null;
  selectedSize: string | null = null;
  selectedVariant: VarianteProducto | null = null;

  cantidad: number = 1;
  maxStock: number = 1;
  loading: boolean = true;

  adding: boolean = false;
  added: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!productId) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProductDetails(productId);
  }

  loadProductDetails(id: number): void {
    this.loading = true;
    this.productoService.getProductoById(id).subscribe({
      next: (prod) => {
        this.producto = prod;
        this.cdr.markForCheck();
        this.loadVariantes(id);
      },
      error: (err) => {
        console.error('Error al cargar producto', err);
        this.router.navigate(['/']);
      }
    });
  }

  loadVariantes(id: number): void {
    this.productoService.getVariantesByProductoId(id).subscribe({
      next: (vars) => {
        this.variantes = vars;
        
        // Extract unique colors and sizes
        this.colores = Array.from(new Set(vars.map(v => v.color)));
        this.tallas = Array.from(new Set(vars.map(v => v.talla)));
        
        // Select first color by default
        if (this.colores.length > 0) {
          this.selectColor(this.colores[0]);
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar variantes', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.selectedVariant = null;
    this.selectedSize = null;
    this.cantidad = 1;
  }

  getActiveProductImage(): string {
    if (this.selectedColor) {
      const variantWithImage = this.variantes.find(v => v.color === this.selectedColor && v.imagenUrl);
      if (variantWithImage && variantWithImage.imagenUrl) {
        return variantWithImage.imagenUrl;
      }
    }
    return this.producto?.imagenGeneralUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop';
  }

  isSizeAvailableForSelectedColor(size: string): boolean {
    if (!this.selectedColor) return false;
    return this.variantes.some(v => v.color === this.selectedColor && v.talla === size && v.stock > 0);
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.selectedVariant = this.variantes.find(
      v => v.color === this.selectedColor && v.talla === size
    ) || null;

    if (this.selectedVariant) {
      this.maxStock = this.selectedVariant.stock;
      this.cantidad = 1;
    }
  }

  incrementQuantity(): void {
    if (this.cantidad < this.maxStock) {
      this.cantidad++;
    }
  }

  decrementQuantity(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  addToCart(): void {
    if (!this.selectedVariant || this.selectedVariant.id === undefined) return;
    
    this.adding = true;
    const sesionId = this.carritoService.getSessionId();
    
    this.carritoService.addItemToCart(sesionId, this.selectedVariant.id, this.cantidad).subscribe({
      next: () => {
        this.adding = false;
        this.added = true;
        this.cdr.markForCheck();
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          this.added = false;
          this.cantidad = 1;
          this.cdr.markForCheck();
        }, 2000);
      },
      error: (err) => {
        console.error('Error al añadir al carrito', err);
        this.adding = false;
        this.cdr.markForCheck();
        alert(err.error?.message || 'Error al añadir el producto al carrito');
      }
    });
  }
}
