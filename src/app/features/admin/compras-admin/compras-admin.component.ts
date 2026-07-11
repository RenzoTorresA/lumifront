import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { CompraService, Compra, CompraItem, CompraRequest } from '../../../core/services/compra.service';
import { ProductoService, Producto, VarianteProducto } from '../../../core/services/producto.service';
import { showErrorAlert, showSuccessAlert } from '../../../shared/utils/swal.helper';

@Component({
  selector: 'app-compras-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout animate-fade-in">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="content-header">
          <div>
            <h1>Historial de Compras y Abastecimiento</h1>
            <p>Registra el ingreso de nueva mercadería y controla los costos de adquisición</p>
          </div>
          <button (click)="openCreateCompraModal()" class="action-btn">+ Registrar Compra</button>
        </header>

        <div *ngIf="loading" class="loader-container">
          <span class="loader"></span>
        </div>

        <div *ngIf="!loading" class="sales-content">
          <!-- Filters -->
          <div class="filters-bar">
            <div class="search-box">
              <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Buscar por proveedor..." class="filter-input" />
            </div>
          </div>

          <!-- Purchases Table -->
          <div class="table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Compra ID</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Comentarios</th>
                  <th>Total Inversión</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredCompras.length === 0">
                  <td colspan="5" class="empty-row">No se encontraron registros de compras.</td>
                </tr>
                <tr *ngFor="let c of filteredCompras">
                  <td><strong>#COMPRA-{{ c.id }}</strong></td>
                  <td>{{ c.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ c.proveedor }}</td>
                  <td>
                    <div class="comment-text" [title]="c.comentarios || ''">{{ c.comentarios || '-' }}</div>
                  </td>
                  <td>
                    <span class="price-detail total-paying-price">S/ {{ c.totalPagar | number:'1.2-2' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ================= MODAL: REGISTRAR COMPRA MANUAL ================= -->
        <div class="modal-overlay" *ngIf="showCreateCompraModal" (click)="closeCreateCompraModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <h3>Registrar Ingreso / Compra de Mercadería</h3>
            
            <form (submit)="submitManualCompra()" class="modal-form">
              <div class="modal-grid">
                <!-- Left side: Supplier Info -->
                <div class="form-section-column">
                  <h4>Datos de la Transacción</h4>
                  <div class="form-group">
                    <label>Nombre del Proveedor</label>
                    <input type="text" [(ngModel)]="compraForm.proveedor" name="mProveedor" required placeholder="Ej: Importaciones Textil SAC" class="filter-input w-full" />
                  </div>
                  <div class="form-group">
                    <label>Comentarios / Observaciones</label>
                    <textarea [(ngModel)]="compraForm.comentarios" name="mComentarios" rows="5" placeholder="Escribe detalles adicionales como número de factura, lote de mercadería..." class="filter-input w-full textarea-field"></textarea>
                  </div>
                </div>
                
                <!-- Right side: Add Products to purchase -->
                <div class="form-section-column">
                  <h4>Agregar Artículos al Lote</h4>
                  
                  <div class="add-item-box">
                    <div class="form-group">
                      <label>Producto</label>
                      <select [ngModel]="selectedProductId" (ngModelChange)="onProductSelect($event)" name="mProduct" class="filter-select w-full">
                        <option [value]="null" disabled selected>Selecciona un producto</option>
                        <option *ngFor="let p of productos" [value]="p.id">
                          {{ p.nombre }}
                        </option>
                      </select>
                    </div>
                    
                    <div class="form-group" *ngIf="selectedProductId">
                      <label>Variante (Talla y Color)</label>
                      <select [ngModel]="selectedVarianteId" (ngModelChange)="onVarianteSelect($event)" name="mVariante" class="filter-select w-full">
                        <option [value]="null" disabled selected>Selecciona Talla/Color</option>
                        <option *ngFor="let v of availableVariantes" [value]="v.id">
                          Talla: {{ v.talla }} | Color: {{ v.color }} (Stock Actual: {{ v.stock }} u.)
                        </option>
                      </select>
                    </div>
                    
                    <div class="qty-add-row" *ngIf="selectedVarianteId">
                      <div class="form-group">
                        <label>Cantidad Adquirida</label>
                        <input type="number" [(ngModel)]="selectedQuantity" name="mCantidad" min="1" class="filter-input w-full" />
                      </div>
                      <div class="form-group">
                        <label>Costo de Compra Unitario (S/)</label>
                        <input type="number" step="0.01" [(ngModel)]="selectedCostPrice" name="mCostPrice" min="0.01" class="filter-input w-full" />
                      </div>
                      <button type="button" (click)="addItemToCompra()" class="action-btn flex-btn" [disabled]="selectedQuantity < 1 || selectedCostPrice <= 0">
                        + Añadir
                      </button>
                    </div>
                  </div>

                  <!-- Selected items summary list -->
                  <div class="items-list-container">
                    <div *ngIf="compraItems.length === 0" class="empty-items-text">
                      No hay artículos agregados a esta orden de compra.
                    </div>
                    <div *ngFor="let item of compraItems; let i = index" class="added-item-row">
                      <div>
                        <div class="added-item-name">{{ item.producto.nombre }}</div>
                        <div class="added-item-desc">
                          Talla: {{ item.variante.talla }} / Color: {{ item.variante.color }} (x{{ item.cantidad }} a S/ {{ item.precioCompra | number:'1.2-2' }}/u)
                        </div>
                      </div>
                      <div class="added-item-actions">
                        <span class="added-item-subtotal">S/ {{ item.subtotal | number:'1.2-2' }}</span>
                        <button type="button" (click)="removeItemFromCompra(i)" class="remove-item-btn">&times;</button>
                      </div>
                    </div>
                  </div>

                  <!-- Pricing calculations -->
                  <div class="pricing-summary">
                    <div class="summary-row total-paying-row">
                      <span>Total Inversión:</span>
                      <span class="total-paying-price">S/ {{ getCompraTotal() | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="modal-actions-row">
                <button type="button" (click)="closeCreateCompraModal()" class="btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="compraItems.length === 0 || submittingCompra" class="action-btn">
                  {{ submittingCompra ? 'Procesando...' : 'Registrar Abastecimiento' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
    }
    .main-content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
    }
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .content-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .content-header p {
      color: var(--admin-text-secondary);
      font-size: 14px;
    }
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 20px;
    }
    .filter-select, .filter-input {
      padding: 10px 16px;
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      background: var(--admin-bg-surface);
      color: var(--admin-text-primary);
      font-family: var(--font-body);
      font-size: 14px;
    }
    .filter-input {
      min-width: 280px;
    }
    .filter-select:focus, .filter-input:focus {
      outline: none;
      border-color: var(--admin-accent);
    }
    .table-wrapper {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }
    .admin-table th, .admin-table td {
      padding: 16px;
      border-bottom: 1px solid var(--admin-border-color);
    }
    .admin-table th {
      font-weight: 600;
      color: var(--admin-text-secondary);
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
    }
    .admin-table tr:hover {
      background: rgba(0, 0, 0, 0.02);
    }
    .price-detail {
      font-weight: 700;
    }
    .comment-text {
      max-width: 350px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--admin-text-secondary);
      font-size: 13px;
    }
    .loader-container {
      display: flex;
      justify-content: center;
      padding: 80px 0;
    }
    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid var(--admin-border-color);
      border-radius: 50%;
      border-top-color: var(--admin-accent);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 300;
    }
    .modal {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-lg);
      padding: 32px;
      max-width: 500px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      color: var(--admin-text-primary);
    }
    .modal-lg {
      max-width: 900px;
    }
    .modal h3 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 24px;
      color: var(--admin-text-primary);
    }
    .modal h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--admin-text-primary);
      border-bottom: 1px solid var(--admin-border-color);
      padding-bottom: 8px;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .form-section-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
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
    .w-full {
      width: 100%;
    }
    .filter-select.w-full {
      box-sizing: border-box;
    }
    .filter-input.w-full {
      min-width: auto;
      box-sizing: border-box;
    }
    .textarea-field {
      font-family: inherit;
      resize: vertical;
    }
    .add-item-box {
      background: var(--admin-bg-base);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .qty-add-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 12px;
      align-items: flex-end;
    }
    .flex-btn {
      padding: 10px 16px;
      height: 40px;
      box-sizing: border-box;
    }
    .items-list-container {
      flex: 1;
      min-height: 150px;
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      background: rgba(0, 0, 0, 0.15);
      padding: 12px;
    }
    .empty-items-text {
      text-align: center;
      color: var(--admin-text-secondary);
      margin-top: 50px;
      font-size: 13px;
    }
    .added-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--admin-border-color);
      padding: 8px 0;
      font-size: 13px;
    }
    .added-item-row:last-child {
      border-bottom: none;
    }
    .added-item-name {
      font-weight: 600;
    }
    .added-item-desc {
      color: var(--admin-text-secondary);
      font-size: 11px;
      margin-top: 2px;
    }
    .added-item-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .added-item-subtotal {
      font-weight: 700;
    }
    .remove-item-btn {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0 4px;
    }
    .pricing-summary {
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid var(--admin-border-color);
      padding-top: 12px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
    }
    .total-paying-row {
      font-weight: 700;
      font-size: 15px;
      border-top: 1px dashed var(--admin-border-color);
      padding-top: 8px;
    }
    .total-paying-price {
      color: var(--admin-accent);
    }
    .modal-actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      border-top: 1px solid var(--admin-border-color);
      padding-top: 20px;
    }
    .btn-secondary {
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
      border: 1px solid var(--admin-border-color);
      padding: 10px 20px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      font-family: var(--font-body);
      transition: var(--transition-fast);
    }
    .btn-secondary:hover {
      background: var(--admin-border-color);
    }
    .action-btn {
      background: var(--admin-accent);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition-fast);
      font-family: var(--font-body);
    }
    .action-btn:hover {
      background: var(--admin-accent-hover);
    }
    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ComprasAdminComponent implements OnInit {
  compras: Compra[] = [];
  filteredCompras: Compra[] = [];
  loading = true;
  searchQuery: string = '';

  // Manual purchase state
  showCreateCompraModal = false;
  submittingCompra = false;
  productos: Producto[] = [];
  
  compraForm = {
    proveedor: '',
    comentarios: ''
  };
  
  compraItems: {
    producto: Producto;
    variante: VarianteProducto;
    cantidad: number;
    precioCompra: number;
    subtotal: number;
  }[] = [];
  
  selectedProductId: number | null = null;
  selectedVarianteId: number | null = null;
  selectedQuantity: number = 1;
  selectedCostPrice: number = 0;
  availableVariantes: VarianteProducto[] = [];

  constructor(
    private compraService: CompraService, 
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompras();
  }

  loadCompras(): void {
    this.loading = true;
    this.compraService.getAllCompras().subscribe({
      next: (data) => {
        this.compras = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar compras', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    this.filteredCompras = this.compras.filter(c => {
      const query = this.searchQuery.toLowerCase().trim();
      return !query || c.proveedor.toLowerCase().includes(query);
    });
  }

  openCreateCompraModal(): void {
    this.compraForm = {
      proveedor: '',
      comentarios: ''
    };
    this.compraItems = [];
    this.resetSelectedItemFields();
    
    // Load Products
    this.productoService.getProductos().subscribe({
      next: (prods: Producto[]) => {
        this.productos = prods;
        this.showCreateCompraModal = true;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Error al cargar productos para compras', err)
    });
  }

  closeCreateCompraModal(): void {
    this.showCreateCompraModal = false;
    this.cdr.markForCheck();
  }

  resetSelectedItemFields(): void {
    this.selectedProductId = null;
    this.selectedVarianteId = null;
    this.selectedQuantity = 1;
    this.selectedCostPrice = 0;
    this.availableVariantes = [];
  }

  onProductSelect(productId: any): void {
    const parsedId = !productId || productId === 'null' ? null : Number(productId);
    this.selectedProductId = parsedId;
    this.selectedVarianteId = null;
    this.selectedQuantity = 1;
    this.selectedCostPrice = 0;
    this.availableVariantes = [];
    
    if (parsedId) {
      this.productoService.getVariantesByProductoId(parsedId).subscribe({
        next: (vars) => {
          this.availableVariantes = vars;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error al cargar variantes', err)
      });
    }
  }

  onVarianteSelect(varianteId: any): void {
    const parsedId = !varianteId || varianteId === 'null' ? null : Number(varianteId);
    this.selectedVarianteId = parsedId;
    this.cdr.markForCheck();
  }

  addItemToCompra(): void {
    if (!this.selectedProductId || !this.selectedVarianteId) return;
    
    const product = this.productos.find(p => p.id === this.selectedProductId);
    const variante = this.availableVariantes.find(v => v.id === this.selectedVarianteId);
    
    if (!product || !variante) return;
    
    // Check if variant already added
    const existingIndex = this.compraItems.findIndex(item => item.variante.id === variante.id);
    
    if (existingIndex !== -1) {
      const newQty = this.compraItems[existingIndex].cantidad + this.selectedQuantity;
      this.compraItems[existingIndex].cantidad = newQty;
      this.compraItems[existingIndex].precioCompra = this.selectedCostPrice; // Update with latest cost price
      this.compraItems[existingIndex].subtotal = this.selectedCostPrice * newQty;
    } else {
      this.compraItems.push({
        producto: product,
        variante: variante,
        cantidad: this.selectedQuantity,
        precioCompra: this.selectedCostPrice,
        subtotal: this.selectedCostPrice * this.selectedQuantity
      });
    }
    
    // Reset selection fields
    this.resetSelectedItemFields();
    this.cdr.markForCheck();
  }

  removeItemFromCompra(index: number): void {
    this.compraItems.splice(index, 1);
    this.cdr.markForCheck();
  }

  getCompraTotal(): number {
    return this.compraItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  submitManualCompra(): void {
    if (this.compraItems.length === 0) return;
    
    this.submittingCompra = true;
    
    const request: CompraRequest = {
      proveedor: this.compraForm.proveedor,
      comentarios: this.compraForm.comentarios,
      items: this.compraItems.map(item => ({
        varianteId: item.variante.id!,
        cantidad: item.cantidad,
        precioCompra: item.precioCompra
      }))
    };
    
    this.compraService.registrarCompra(request).subscribe({
      next: (compra) => {
        this.submittingCompra = false;
        this.showCreateCompraModal = false;
        void showSuccessAlert('Compra registrada', `Ingreso #COMPRA-${compra.id} registrado con éxito.`);
        this.loadCompras();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al registrar compra manual', err);
        this.submittingCompra = false;
        void showErrorAlert('No se pudo registrar la compra', err.error?.message || 'Error al procesar la compra.');
        this.cdr.markForCheck();
      }
    });
  }
}
