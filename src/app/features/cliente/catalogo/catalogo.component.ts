import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, Categoria, Subcategoria } from '../../../core/services/producto.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <main class="catalogo-container animate-fade-in">
      <!-- Hero Banner -->
      <section class="hero">
        <div class="hero-content">
          <span class="hero-badge">Colección 2026</span>
          <h1>Colección Lumi Store</h1>
          <p>El balance perfecto entre tendencia, comodidad y originalidad. Descubre lo nuevo que tenemos para renovar tu look.</p>
          <a (click)="scrollToProducts()" class="explore-link">
            Explorar catálogo <span class="arrow">↓</span>
          </a>
        </div>
      </section>

      <!-- Benefits / Trust Bar -->
      <section class="benefits-bar">
        <div class="benefit-item">
          <svg class="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <div class="benefit-text">
            <strong>Envíos a todo el Perú</strong>
            <span>Coordinación rápida y segura</span>
          </div>
        </div>
        
        <div class="benefit-item">
          <svg class="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <div class="benefit-text">
            <strong>Soporte 24/7</strong>
            <span>Atención directa por WhatsApp</span>
          </div>
        </div>
        
        <div class="benefit-item">
          <svg class="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <div class="benefit-text">
            <strong>Calidad Premium</strong>
            <span>Telas seleccionadas con amor</span>
          </div>
        </div>
      </section>

      <!-- Main Layout -->
      <div class="layout">
        <!-- Sidebar filters -->
        <aside class="filters-sidebar">
          <div class="filter-group">
            <h3>Buscar</h3>
            <input type="text" [(ngModel)]="searchTerm" (input)="onFilterChange()" placeholder="¿Qué estás buscando?" class="search-input" />
          </div>

          <div class="filter-group">
            <h3>Categorías</h3>
            <div class="category-list">
              <button [class.active]="selectedCategory === null && selectedSubcategory === null" (click)="selectCategory(null)" class="category-btn">
                Todos los productos
              </button>
              
              <ng-container *ngFor="let cat of categorias">
                <button [class.active]="selectedCategory === cat.id && selectedSubcategory === null" (click)="selectCategory(cat.id!)" class="category-btn">
                  {{ cat.nombre }}
                </button>
                
                <div class="subcategory-list" *ngIf="selectedCategory === cat.id && getSubcategoriasForCategory(cat.id!).length > 0">
                  <button 
                    *ngFor="let sub of getSubcategoriasForCategory(cat.id!)" 
                    [class.active]="selectedSubcategory === sub.id" 
                    (click)="selectSubcategory(sub.id!)" 
                    class="subcategory-btn">
                    ↳ {{ sub.nombre }}
                  </button>
                </div>
              </ng-container>
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <section class="products-section">
          <div class="grid-header">
            <p class="count">{{ productos.length }} artículos encontrados</p>
          </div>

          <div *ngIf="loading" class="loader-container">
            <span class="loader"></span>
          </div>

          <div *ngIf="!loading && productos.length === 0" class="empty-state">
            <p>No se encontraron productos coincidentes con los filtros seleccionados.</p>
          </div>

          <div *ngIf="!loading" class="products-grid">
            <article *ngFor="let prod of paginatedProductos" class="product-card" [routerLink]="['/producto', prod.id]">
              <div class="img-wrapper">
                <img [src]="getImageUrl(prod.imagenGeneralUrl)" [alt]="prod.nombre" />
                <span class="view-overlay">Ver Detalle</span>
              </div>
              <div class="product-info">
                <h4>{{ prod.nombre }}</h4>
                <p class="price">S/ {{ prod.precioBase | number:'1.2-2' }}</p>
              </div>
            </article>
          </div>

          <!-- Dynamic Pagination Controls -->
          <div class="dynamic-pagination-container" *ngIf="!loading">
            <!-- Spinner for loading more -->
            <div *ngIf="loadingMore" class="loading-more-spinner animate-fade-in">
              <span class="mini-loader"></span>
              <p>Cargando más prendas...</p>
            </div>

            <!-- Ver más Button -->
            <div *ngIf="showLoadMoreButton && visibleCount < productos.length" class="load-more-action">
              <button (click)="loadMoreManually()" class="btn-ver-mas">
                Ver más
              </button>
            </div>
            
            <!-- End of catalog message -->
            <div *ngIf="!showLoadMoreButton && visibleCount >= productos.length && productos.length > 0" class="end-catalog-msg animate-fade-in">
              <span>Has visto todas las prendas</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [`
    .catalogo-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 24px;
    }
    .hero {
      position: relative;
      background: linear-gradient(90deg, rgba(28, 26, 23, 0.8) 0%, rgba(28, 26, 23, 0.4) 60%, rgba(28, 26, 23, 0.15) 100%), url('/image1.png') no-repeat center center / cover;
      border-radius: var(--radius-lg);
      padding: 80px 60px;
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      min-height: 480px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .hero-content {
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--accent-base);
      background: rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(197, 168, 128, 0.3);
      margin-bottom: 8px;
      backdrop-filter: blur(4px);
    }
    .hero-content h1 {
      font-size: 38px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.03em;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .hero-content p {
      color: #eae7e0;
      font-size: 16px;
      max-width: 520px;
      margin: 0;
      line-height: 1.6;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    .explore-link {
      display: inline-flex;
      align-items: center;
      margin-top: 16px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: var(--transition-fast);
      gap: 6px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    .explore-link:hover {
      color: var(--accent-base);
    }
    .explore-link .arrow {
      transition: var(--transition-fast);
      display: inline-block;
    }
    .explore-link:hover .arrow {
      transform: translateY(4px);
    }
    .benefits-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin-bottom: 40px;
    }
    .benefit-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .benefit-icon {
      width: 28px;
      height: 28px;
      color: var(--accent-base);
      flex-shrink: 0;
    }
    .benefit-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .benefit-text strong {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 600;
    }
    .benefit-text span {
      font-size: 12px;
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .hero {
        padding: 40px 24px;
        min-height: 200px;
        background-image: linear-gradient(0deg, rgba(28, 26, 23, 0.75) 0%, rgba(28, 26, 23, 0.5) 100%), url('/image.png');
      }
      .hero-content h1 {
        font-size: 28px;
      }
      .hero-content p {
        font-size: 14px;
        max-width: 100%;
      }
      .benefits-bar {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 20px;
      }
    }
    .layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 40px;
    }
    @media (max-width: 768px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
    .filters-sidebar {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .filter-group h3 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      color: var(--text-primary);
    }
    .search-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 14px;
      background: var(--bg-surface);
      color: var(--text-primary);
      transition: var(--transition-fast);
    }
    .search-input:focus {
      outline: none;
      border-color: var(--text-primary);
    }
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .category-btn {
      text-align: left;
      background: none;
      border: none;
      padding: 10px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: var(--transition-fast);
    }
    .category-btn:hover, .category-btn.active {
      color: var(--text-primary);
      background: var(--bg-card);
    }
    .category-btn.active {
      font-weight: 600;
    }
    .subcategory-list {
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }
    .subcategory-btn {
      text-align: left;
      background: none;
      border: none;
      padding: 6px 12px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
    }
    .subcategory-btn:hover, .subcategory-btn.active {
      color: var(--text-primary);
      background: var(--bg-card);
    }
    .subcategory-btn.active {
      font-weight: 600;
    }
    .products-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .count {
      font-size: 14px;
      color: var(--text-secondary);
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 32px;
    }
    @media (max-width: 600px) {
      .catalogo-container {
        padding: 0 12px;
        margin: 20px auto;
      }
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .product-card {
        gap: 10px;
      }
      .product-info h4 {
        font-size: 13px;
      }
      .price {
        font-size: 13px;
      }
    }
    .product-card {
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 16px;
      group: hover;
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      padding-top: 135%; /* Aspect ratio for fashion clothing */
      background-color: var(--bg-card);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .img-wrapper img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .product-card:hover .img-wrapper img {
      transform: scale(1.06);
    }
    .view-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(17, 17, 17, 0.7);
      backdrop-filter: blur(4px);
      color: white;
      text-align: center;
      padding: 12px 0;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .product-card:hover .view-overlay {
      transform: translateY(0);
    }
    .product-info h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .price {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent-base);
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
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: var(--text-secondary);
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-color);
    }
    .dynamic-pagination-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      width: 100%;
    }
    .btn-ver-mas {
      background: var(--primary-base, #1c1a17);
      color: var(--bg-surface, #ffffff);
      border: 1px solid var(--primary-base, #1c1a17);
      padding: 14px 32px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }
    .btn-ver-mas:hover {
      background: var(--accent-base, #c5a880);
      border-color: var(--accent-base, #c5a880);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(197, 168, 128, 0.2);
    }
    .btn-ver-mas:active {
      transform: translateY(0);
    }
    .end-catalog-msg {
      font-size: 13px;
      color: var(--text-secondary);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 16px 0;
      position: relative;
    }
    .end-catalog-msg::before, .end-catalog-msg::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40px;
      height: 1px;
      background: var(--border-color);
    }
    .end-catalog-msg::before {
      right: 100%;
      margin-right: 16px;
    }
    .end-catalog-msg::after {
      left: 100%;
      margin-left: 16px;
    }
    .loading-more-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .mini-loader {
      width: 24px;
      height: 24px;
      border: 2px solid var(--border-color);
      border-radius: 50%;
      border-top-color: var(--accent-base);
      animation: spin 0.8s linear infinite;
    }
  `]
})
export class CatalogoComponent implements OnInit {
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  productos: Producto[] = [];
  selectedCategory: number | null = null;
  selectedSubcategory: number | null = null;
  searchTerm: string = '';
  loading: boolean = true;

  // Dynamic Scroll Pagination
  pageSize: number = 6;
  visibleCount: number = 6;
  scrollLoadsCount: number = 0;
  showLoadMoreButton: boolean = false;
  loadingMore: boolean = false;

  get paginatedProductos(): Producto[] {
    return this.productos.slice(0, this.visibleCount);
  }

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
  }

  getImageUrl(url: string | null | undefined): string {
    return this.productoService.getImageUrl(url);
  }

  loadCategorias(): void {
    this.productoService.getActiveCategorias().subscribe({
      next: (data) => {
        this.categorias = data;

        this.productoService.getActiveSubcategorias().subscribe({
          next: (subs) => {
            this.subcategorias = subs;
            this.cdr.markForCheck();
          },
          error: (err) => console.error('Error al cargar subcategorías', err)
        });
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  loadProductos(): void {
    this.loading = true;
    this.productoService.getProductos(
      this.selectedCategory !== null ? this.selectedCategory : undefined,
      this.selectedSubcategory !== null ? this.selectedSubcategory : undefined,
      this.searchTerm ? this.searchTerm : undefined
    ).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.resetPagination();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetPagination(): void {
    this.visibleCount = this.pageSize;
    this.scrollLoadsCount = 0;
    this.showLoadMoreButton = false;
    this.loadingMore = false;
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory = categoryId;
    this.selectedSubcategory = null;
    this.loadProductos();
  }

  selectSubcategory(subcategoryId: number | null): void {
    this.selectedSubcategory = subcategoryId;
    if (subcategoryId !== null) {
      // Find parent category to sync selectedCategory selection
      const sub = this.subcategorias.find(s => s.id === subcategoryId);
      if (sub) {
        this.selectedCategory = sub.categoriaId;
      }
    }
    this.loadProductos();
  }

  getSubcategoriasForCategory(catId: number): Subcategoria[] {
    return this.subcategorias.filter(s => s.categoriaId === catId && s.estado);
  }

  onFilterChange(): void {
    this.loadProductos();
  }

  scrollToProducts(): void {
    const element = document.querySelector('.layout');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.loading || this.loadingMore || this.showLoadMoreButton) {
      return;
    }

    const threshold = 700;
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (position >= height - threshold) {
      this.loadMoreOnScroll();
    }
  }

  loadMoreOnScroll(): void {
    if (this.visibleCount >= this.productos.length) {
      return;
    }

    if (this.scrollLoadsCount < 3) {
      this.loadingMore = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.visibleCount += this.pageSize;
        this.scrollLoadsCount++;
        this.loadingMore = false;
        this.cdr.markForCheck();
      }, 400);
    } else {
      this.showLoadMoreButton = true;
      this.cdr.markForCheck();
    }
  }

  loadMoreManually(): void {
    this.loadingMore = true;
    this.showLoadMoreButton = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.visibleCount += this.pageSize;
      this.loadingMore = false;
      this.cdr.markForCheck();
    }, 400);
  }
}
