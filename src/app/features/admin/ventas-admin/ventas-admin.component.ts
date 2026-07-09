import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { VentaService, Venta, AdminCheckoutRequest } from '../../../core/services/venta.service';
import { ProductoService, Producto, VarianteProducto } from '../../../core/services/producto.service';
import { UbigeoService, Ubigeo } from '../../../core/services/ubigeo.service';

@Component({
  selector: 'app-ventas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout animate-fade-in">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="content-header">
          <div>
            <h1>Gestión de Ventas y Pedidos</h1>
            <p>Supervisa las órdenes de compra y registra ventas de manera manual</p>
          </div>
          <button (click)="openCreateSaleModal()" class="action-btn">+ Registrar Venta</button>
        </header>

        <div *ngIf="loading" class="loader-container">
          <span class="loader"></span>
        </div>

        <div *ngIf="!loading" class="sales-content">
          <!-- Filters -->
          <div class="filters-bar">
            <div class="filter-group">
              <label>Estado</label>
              <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
                <option value="todos">Todos los pedidos</option>
                <option value="pendiente">Pendientes</option>
                <option value="enviado">Enviados</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            <div class="search-box">
              <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Buscar por cliente o teléfono..." class="filter-input" />
            </div>
          </div>

          <!-- Kanban Board -->
          <div class="kanban-board">
            <!-- Column: Pendiente -->
            <div class="kanban-column">
              <div class="column-header">
                <span class="indicator pendiente"></span>
                <h3>Pendientes</h3>
                <span class="badge">{{ getVentasByStatus('pendiente').length }}</span>
              </div>
              <div class="cards-list">
                <div *ngIf="getVentasByStatus('pendiente').length === 0" class="empty-column-state">No hay pedidos pendientes</div>
                <div *ngFor="let v of getVentasByStatus('pendiente')" class="kanban-card">
                  <!-- Card Header -->
                  <div class="card-header">
                    <span class="card-code">#LUMI-{{ v.id }}</span>
                    <span class="card-date">{{ v.fecha | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <!-- Card Content -->
                  <div class="card-body-content">
                    <div class="client-info-item">
                      <span class="label">Cliente:</span>
                      <strong class="value">{{ v.clienteNombre }}</strong>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Celular:</span>
                      <span class="value">{{ v.clienteTelefono }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Ubicación:</span>
                      <span class="value">{{ getUbigeoName(v.ubigeoId) }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Dirección:</span>
                      <span class="value">{{ v.direccionReferencia }}</span>
                    </div>
                    <div class="price-summary">
                      <div class="total-to-pay">S/ {{ v.totalPagar | number:'1.2-2' }}</div>
                      <div class="delivery-fee">(Envío: S/ {{ v.costoDelivery | number:'1.2-2' }})</div>
                    </div>
                  </div>
                  <!-- Divider -->
                  <div class="card-divider"></div>
                  <!-- Expandable details -->
                  <div class="details-toggle-section">
                    <button type="button" (click)="toggleSaleExpand(v.id!)" class="btn-toggle-details">
                      {{ expandedSales[v.id!] ? 'Ocultar productos' : 'Ver productos' }}
                      <svg [class.rotated]="expandedSales[v.id!]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <div *ngIf="expandedSales[v.id!]" class="expanded-details-container animate-fade-in">
                      <div *ngIf="loadingDetails[v.id!]" class="details-loader">
                        <span class="loader-sm"></span>
                      </div>
                      <div *ngIf="!loadingDetails[v.id!] && saleItemsMap[v.id!]" class="details-items-list">
                        <div *ngFor="let item of saleItemsMap[v.id!]" class="detail-item">
                          <div class="item-meta">
                            <span class="item-name">{{ item.productoNombre }}</span>
                            <span class="item-variant">Talla: {{ item.talla }} / Color: {{ item.color }}</span>
                          </div>
                          <div class="item-pricing">
                            <span>{{ item.cantidad }}x S/ {{ item.precioUnitario | number:'1.2-2' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Card Footer Actions -->
                  <div class="card-footer-actions">
                    <label class="status-label">Estado:</label>
                    <select [ngModel]="v.estado" (change)="updateStatus(v.id!, $any($event.target).value)" class="card-status-select" [class]="v.estado">
                      <option value="pendiente">pendiente</option>
                      <option value="completado">pagado</option>
                      <option value="enviado">enviado</option>
                      <option value="entregado">entregado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column: Pagado -->
            <div class="kanban-column">
              <div class="column-header">
                <span class="indicator completado"></span>
                <h3>Pagados</h3>
                <span class="badge">{{ getVentasByStatus('completado').length }}</span>
              </div>
              <div class="cards-list">
                <div *ngIf="getVentasByStatus('completado').length === 0" class="empty-column-state">No hay pedidos pagados</div>
                <div *ngFor="let v of getVentasByStatus('completado')" class="kanban-card">
                  <!-- Card Header -->
                  <div class="card-header">
                    <span class="card-code">#LUMI-{{ v.id }}</span>
                    <span class="card-date">{{ v.fecha | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <!-- Card Content -->
                  <div class="card-body-content">
                    <div class="client-info-item">
                      <span class="label">Cliente:</span>
                      <strong class="value">{{ v.clienteNombre }}</strong>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Celular:</span>
                      <span class="value">{{ v.clienteTelefono }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Ubicación:</span>
                      <span class="value">{{ getUbigeoName(v.ubigeoId) }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Dirección:</span>
                      <span class="value">{{ v.direccionReferencia }}</span>
                    </div>
                    <div class="price-summary">
                      <div class="total-to-pay">S/ {{ v.totalPagar | number:'1.2-2' }}</div>
                      <div class="delivery-fee">(Envío: S/ {{ v.costoDelivery | number:'1.2-2' }})</div>
                    </div>
                  </div>
                  <!-- Divider -->
                  <div class="card-divider"></div>
                  <!-- Expandable details -->
                  <div class="details-toggle-section">
                    <button type="button" (click)="toggleSaleExpand(v.id!)" class="btn-toggle-details">
                      {{ expandedSales[v.id!] ? 'Ocultar productos' : 'Ver productos' }}
                      <svg [class.rotated]="expandedSales[v.id!]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <div *ngIf="expandedSales[v.id!]" class="expanded-details-container animate-fade-in">
                      <div *ngIf="loadingDetails[v.id!]" class="details-loader">
                        <span class="loader-sm"></span>
                      </div>
                      <div *ngIf="!loadingDetails[v.id!] && saleItemsMap[v.id!]" class="details-items-list">
                        <div *ngFor="let item of saleItemsMap[v.id!]" class="detail-item">
                          <div class="item-meta">
                            <span class="item-name">{{ item.productoNombre }}</span>
                            <span class="item-variant">Talla: {{ item.talla }} / Color: {{ item.color }}</span>
                          </div>
                          <div class="item-pricing">
                            <span>{{ item.cantidad }}x S/ {{ item.precioUnitario | number:'1.2-2' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Card Footer Actions -->
                  <div class="card-footer-actions">
                    <label class="status-label">Estado:</label>
                    <select [ngModel]="v.estado" (change)="updateStatus(v.id!, $any($event.target).value)" class="card-status-select" [class]="v.estado">
                      <option value="pendiente">pendiente</option>
                      <option value="completado">pagado</option>
                      <option value="enviado">enviado</option>
                      <option value="entregado">entregado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column: Enviado -->
            <div class="kanban-column">
              <div class="column-header">
                <span class="indicator enviado"></span>
                <h3>Enviados</h3>
                <span class="badge">{{ getVentasByStatus('enviado').length }}</span>
              </div>
              <div class="cards-list">
                <div *ngIf="getVentasByStatus('enviado').length === 0" class="empty-column-state">No hay pedidos enviados</div>
                <div *ngFor="let v of getVentasByStatus('enviado')" class="kanban-card">
                  <!-- Card Header -->
                  <div class="card-header">
                    <span class="card-code">#LUMI-{{ v.id }}</span>
                    <span class="card-date">{{ v.fecha | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <!-- Card Content -->
                  <div class="card-body-content">
                    <div class="client-info-item">
                      <span class="label">Cliente:</span>
                      <strong class="value">{{ v.clienteNombre }}</strong>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Celular:</span>
                      <span class="value">{{ v.clienteTelefono }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Ubicación:</span>
                      <span class="value">{{ getUbigeoName(v.ubigeoId) }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Dirección:</span>
                      <span class="value">{{ v.direccionReferencia }}</span>
                    </div>
                    <div class="price-summary">
                      <div class="total-to-pay">S/ {{ v.totalPagar | number:'1.2-2' }}</div>
                      <div class="delivery-fee">(Envío: S/ {{ v.costoDelivery | number:'1.2-2' }})</div>
                    </div>
                  </div>
                  <!-- Divider -->
                  <div class="card-divider"></div>
                  <!-- Expandable details -->
                  <div class="details-toggle-section">
                    <button type="button" (click)="toggleSaleExpand(v.id!)" class="btn-toggle-details">
                      {{ expandedSales[v.id!] ? 'Ocultar productos' : 'Ver productos' }}
                      <svg [class.rotated]="expandedSales[v.id!]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <div *ngIf="expandedSales[v.id!]" class="expanded-details-container animate-fade-in">
                      <div *ngIf="loadingDetails[v.id!]" class="details-loader">
                        <span class="loader-sm"></span>
                      </div>
                      <div *ngIf="!loadingDetails[v.id!] && saleItemsMap[v.id!]" class="details-items-list">
                        <div *ngFor="let item of saleItemsMap[v.id!]" class="detail-item">
                          <div class="item-meta">
                            <span class="item-name">{{ item.productoNombre }}</span>
                            <span class="item-variant">Talla: {{ item.talla }} / Color: {{ item.color }}</span>
                          </div>
                          <div class="item-pricing">
                            <span>{{ item.cantidad }}x S/ {{ item.precioUnitario | number:'1.2-2' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Card Footer Actions -->
                  <div class="card-footer-actions">
                    <label class="status-label">Estado:</label>
                    <select [ngModel]="v.estado" (change)="updateStatus(v.id!, $any($event.target).value)" class="card-status-select" [class]="v.estado">
                      <option value="pendiente">pendiente</option>
                      <option value="completado">pagado</option>
                      <option value="enviado">enviado</option>
                      <option value="entregado">entregado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column: Entregado -->
            <div class="kanban-column">
              <div class="column-header">
                <span class="indicator entregado"></span>
                <h3>Entregados</h3>
                <span class="badge">{{ getVentasByStatus('entregado').length }}</span>
              </div>
              <div class="cards-list">
                <div *ngIf="getVentasByStatus('entregado').length === 0" class="empty-column-state">No hay pedidos entregados</div>
                <div *ngFor="let v of getVentasByStatus('entregado')" class="kanban-card">
                  <!-- Card Header -->
                  <div class="card-header">
                    <span class="card-code">#LUMI-{{ v.id }}</span>
                    <span class="card-date">{{ v.fecha | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <!-- Card Content -->
                  <div class="card-body-content">
                    <div class="client-info-item">
                      <span class="label">Cliente:</span>
                      <strong class="value">{{ v.clienteNombre }}</strong>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Celular:</span>
                      <span class="value">{{ v.clienteTelefono }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Ubicación:</span>
                      <span class="value">{{ getUbigeoName(v.ubigeoId) }}</span>
                    </div>
                    <div class="client-info-item">
                      <span class="label">Dirección:</span>
                      <span class="value">{{ v.direccionReferencia }}</span>
                    </div>
                    <div class="price-summary">
                      <div class="total-to-pay">S/ {{ v.totalPagar | number:'1.2-2' }}</div>
                      <div class="delivery-fee">(Envío: S/ {{ v.costoDelivery | number:'1.2-2' }})</div>
                    </div>
                  </div>
                  <!-- Divider -->
                  <div class="card-divider"></div>
                  <!-- Expandable details -->
                  <div class="details-toggle-section">
                    <button type="button" (click)="toggleSaleExpand(v.id!)" class="btn-toggle-details">
                      {{ expandedSales[v.id!] ? 'Ocultar productos' : 'Ver productos' }}
                      <svg [class.rotated]="expandedSales[v.id!]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="arrow-icon">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <div *ngIf="expandedSales[v.id!]" class="expanded-details-container animate-fade-in">
                      <div *ngIf="loadingDetails[v.id!]" class="details-loader">
                        <span class="loader-sm"></span>
                      </div>
                      <div *ngIf="!loadingDetails[v.id!] && saleItemsMap[v.id!]" class="details-items-list">
                        <div *ngFor="let item of saleItemsMap[v.id!]" class="detail-item">
                          <div class="item-meta">
                            <span class="item-name">{{ item.productoNombre }}</span>
                            <span class="item-variant">Talla: {{ item.talla }} / Color: {{ item.color }}</span>
                          </div>
                          <div class="item-pricing">
                            <span>{{ item.cantidad }}x S/ {{ item.precioUnitario | number:'1.2-2' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Card Footer Actions -->
                  <div class="card-footer-actions">
                    <label class="status-label">Estado:</label>
                    <select [ngModel]="v.estado" (change)="updateStatus(v.id!, $any($event.target).value)" class="card-status-select" [class]="v.estado">
                      <option value="pendiente">pendiente</option>
                      <option value="completado">pagado</option>
                      <option value="enviado">enviado</option>
                      <option value="entregado">entregado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= MODAL: REGISTRAR VENTA MANUAL ================= -->
        <div class="modal-overlay" *ngIf="showCreateSaleModal" (click)="closeCreateSaleModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <h3>Registrar Nueva Venta Manual</h3>
            
            <form (submit)="submitManualSale()" class="modal-form">
              <div class="modal-grid">
                <!-- Left side: Client Info -->
                <div class="form-section-column">
                  <h4>Datos del Cliente</h4>
                  <div class="form-group">
                    <label>Nombre del Cliente</label>
                    <input type="text" [(ngModel)]="saleForm.clienteNombre" name="mClienteNombre" required placeholder="Nombre y Apellidos" class="filter-input w-full" />
                  </div>
                  <div class="form-group">
                    <label>Teléfono / Celular</label>
                    <input type="text" [(ngModel)]="saleForm.clienteTelefono" name="mClienteTelefono" required placeholder="Ej: 987654321" class="filter-input w-full" />
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                      <label>Departamento</label>
                      <select [(ngModel)]="selectedDpto" (change)="onDptoChange()" name="mDpto" required class="filter-select w-full">
                        <option value="" disabled selected>Departamento</option>
                        <option *ngFor="let d of departamentos" [value]="d.coddpto">{{ d.nombre }}</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Provincia</label>
                      <select [(ngModel)]="selectedProv" (change)="onProvChange()" [disabled]="!selectedDpto" name="mProv" required class="filter-select w-full">
                        <option value="" disabled selected>Provincia</option>
                        <option *ngFor="let p of provincias" [value]="p.codprov">{{ p.nombre }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Distrito (Envío)</label>
                    <select [(ngModel)]="saleForm.ubigeoId" (change)="onDistChange()" [disabled]="!selectedProv" name="mUbigeoId" required class="filter-select w-full">
                      <option value="" disabled selected>Selecciona distrito</option>
                      <option *ngFor="let di of distritos" [value]="di.id">
                        {{ di.nombre }} (Envío: S/ {{ di.precioDelivery | number:'1.2-2' }})
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Dirección y Referencia</label>
                    <textarea [(ngModel)]="saleForm.direccionReferencia" name="mDireccion" required rows="2" placeholder="Ej: Av. Larco 123 Dpto 401" class="filter-input w-full textarea-field"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Estado Inicial del Pedido</label>
                    <select [(ngModel)]="saleForm.estado" name="mEstado" required class="filter-select w-full">
                      <option value="pendiente">pendiente</option>
                      <option value="enviado">enviado</option>
                      <option value="completado">completado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </div>
                </div>
                
                <!-- Right side: Add Products -->
                <div class="form-section-column">
                  <h4>Agregar Artículos</h4>
                  
                  <div class="add-item-box">
                    <div class="form-group">
                      <label>Producto</label>
                      <select [ngModel]="selectedProductId" (ngModelChange)="onProductSelect($event)" name="mProduct" class="filter-select w-full">
                        <option [value]="null" disabled selected>Selecciona un producto</option>
                        <option *ngFor="let p of productos" [value]="p.id">
                          {{ p.nombre }} (S/ {{ p.precioBase | number:'1.2-2' }})
                        </option>
                      </select>
                    </div>
                    
                    <div class="form-group" *ngIf="selectedProductId">
                      <label>Variante (Talla y Color)</label>
                      <select [ngModel]="selectedVarianteId" (ngModelChange)="onVarianteSelect($event)" name="mVariante" class="filter-select w-full">
                        <option [value]="null" disabled selected>Selecciona Talla/Color</option>
                        <option *ngFor="let v of availableVariantes" [value]="v.id" [disabled]="v.stock <= 0">
                          Talla: {{ v.talla }} | Color: {{ v.color }} (Stock: {{ v.stock }} u.)
                        </option>
                      </select>
                    </div>
                    
                    <div class="qty-add-row" *ngIf="selectedVarianteId">
                      <div class="form-group">
                        <label>Cantidad (Max: {{ selectedVarianteMaxStock }})</label>
                        <input type="number" [(ngModel)]="selectedQuantity" name="mCantidad" min="1" [max]="selectedVarianteMaxStock" class="filter-input w-full" />
                      </div>
                      <div class="form-group">
                        <label>Precio Venta (S/)</label>
                        <input type="number" step="0.01" [(ngModel)]="selectedPrice" name="mSelectedPrice" min="0.01" class="filter-input w-full" />
                      </div>
                      <button type="button" (click)="addItemToSale()" class="action-btn flex-btn" [disabled]="selectedQuantity < 1 || selectedQuantity > selectedVarianteMaxStock || selectedPrice <= 0">
                        + Añadir
                      </button>
                    </div>
                  </div>

                  <!-- Selected items summary list -->
                  <div class="items-list-container">
                    <div *ngIf="saleItems.length === 0" class="empty-items-text">
                      No hay productos agregados a este pedido.
                    </div>
                    <div *ngFor="let item of saleItems; let i = index" class="added-item-row">
                      <div>
                        <div class="added-item-name">{{ item.producto.nombre }}</div>
                        <div class="added-item-desc">
                          Talla: {{ item.variante.talla }} / Color: {{ item.variante.color }} (x{{ item.cantidad }} a S/ {{ item.precioUnitario | number:'1.2-2' }}/u)
                        </div>
                      </div>
                      <div class="added-item-actions">
                        <span class="added-item-subtotal">S/ {{ item.subtotal | number:'1.2-2' }}</span>
                        <button type="button" (click)="removeItemFromSale(i)" class="remove-item-btn">&times;</button>
                      </div>
                    </div>
                  </div>

                  <!-- Pricing calculations -->
                  <div class="pricing-summary">
                    <div class="summary-row">
                      <span>Subtotal productos:</span>
                      <span>S/ {{ getSaleSubtotal() | number:'1.2-2' }}</span>
                    </div>
                    <div class="summary-row">
                      <span>Costo de envío:</span>
                      <span>S/ {{ getSaleDeliveryFee() | number:'1.2-2' }}</span>
                    </div>
                    <div class="summary-row total-paying-row">
                      <span>Total a pagar:</span>
                      <span class="total-paying-price">S/ {{ (getSaleSubtotal() + getSaleDeliveryFee()) | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="modal-actions-row">
                <button type="button" (click)="closeCreateSaleModal()" class="btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="saleItems.length === 0 || submittingSale" class="action-btn">
                  {{ submittingSale ? 'Procesando...' : 'Registrar Pedido' }}
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
    @media (max-width: 768px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
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
    /* Kanban Board Styles */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      align-items: start;
      margin-top: 10px;
    }
    @media (max-width: 1200px) {
      .kanban-board {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 768px) {
      .kanban-board {
        grid-template-columns: 1fr;
      }
    }
    .kanban-column {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-lg);
      padding: 16px;
      min-height: 550px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: var(--shadow-sm);
    }
    .column-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--admin-border-color);
    }
    .column-header h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--admin-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
      flex: 1;
    }
    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .indicator.pendiente {
      background: #fbbf24;
    }
    .indicator.completado {
      background: #10b981;
    }
    .indicator.enviado {
      background: #3b82f6;
    }
    .indicator.entregado {
      background: #8b5cf6;
    }
    .badge {
      background: var(--admin-bg-base);
      color: var(--admin-text-secondary);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: var(--radius-full);
      border: 1px solid var(--admin-border-color);
    }
    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }
    .empty-column-state {
      text-align: center;
      padding: 32px 16px;
      color: var(--admin-text-secondary);
      font-size: 13px;
      border: 1px dashed var(--admin-border-color);
      border-radius: var(--radius-md);
      background: rgba(0, 0, 0, 0.01);
    }
    .kanban-card {
      background: var(--admin-bg-base);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--shadow-sm);
      transition: var(--transition-smooth);
    }
    .kanban-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--admin-text-secondary);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-code {
      font-size: 14px;
      font-weight: 700;
      color: var(--admin-text-primary);
    }
    .card-date {
      font-size: 11px;
      color: var(--admin-text-secondary);
    }
    .client-info-item {
      display: grid;
      grid-template-columns: 80px 1fr;
      font-size: 13px;
      line-height: 1.4;
    }
    .client-info-item .label {
      color: var(--admin-text-secondary);
      font-weight: 500;
    }
    .client-info-item .value {
      color: var(--admin-text-primary);
      word-break: break-word;
    }
    .price-summary {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px dashed var(--admin-border-color);
    }
    .total-to-pay {
      font-size: 16px;
      font-weight: 800;
      color: var(--admin-text-primary);
    }
    .delivery-fee {
      font-size: 11px;
      color: var(--admin-text-secondary);
    }
    .card-divider {
      height: 1px;
      background: var(--admin-border-color);
    }
    .btn-toggle-details {
      background: none;
      border: none;
      font-size: 12px;
      font-weight: 600;
      color: var(--admin-text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      transition: var(--transition-fast);
      width: 100%;
      justify-content: space-between;
    }
    .btn-toggle-details:hover {
      color: var(--admin-text-primary);
    }
    .arrow-icon {
      width: 14px;
      height: 14px;
      transition: transform 0.2s ease;
    }
    .arrow-icon.rotated {
      transform: rotate(180deg);
    }
    .expanded-details-container {
      margin-top: 8px;
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 10px;
      font-size: 12px;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .item-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
    }
    .item-name {
      font-weight: 600;
      color: var(--admin-text-primary);
    }
    .item-variant {
      color: var(--admin-text-secondary);
      font-size: 11px;
    }
    .item-pricing {
      font-weight: 700;
      color: var(--admin-text-primary);
      text-align: right;
    }
    .card-footer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid var(--admin-border-color);
    }
    .status-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--admin-text-secondary);
    }
    .card-status-select {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: var(--radius-md);
      border: 1px solid var(--admin-border-color);
      font-weight: 600;
      cursor: pointer;
      outline: none;
      font-family: var(--font-body);
      transition: var(--transition-fast);
    }
    select.card-status-select.pendiente {
      background: rgba(245, 158, 11, 0.1);
      color: #b45309;
      border-color: rgba(245, 158, 11, 0.2);
    }
    select.card-status-select.completado {
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
      border-color: rgba(16, 185, 129, 0.2);
    }
    select.card-status-select.enviado {
      background: rgba(59, 130, 246, 0.1);
      color: #1d4ed8;
      border-color: rgba(59, 130, 246, 0.2);
    }
    select.card-status-select.entregado {
      background: rgba(139, 92, 246, 0.1);
      color: #6d28d9;
      border-color: rgba(139, 92, 246, 0.2);
    }
    select.card-status-select.cancelado {
      background: rgba(239, 68, 68, 0.1);
      color: #b91c1c;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .details-loader {
      display: flex;
      justify-content: center;
      padding: 12px 0;
    }
    .loader-sm {
      width: 16px;
      height: 16px;
      border: 2px solid var(--admin-border-color);
      border-radius: 50%;
      border-top-color: var(--admin-text-primary);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty-row {
      text-align: center;
      color: var(--admin-text-secondary);
      padding: 32px !important;
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
    @media (max-width: 768px) {
      .modal-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
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
export class VentasAdminComponent implements OnInit {
  ventas: Venta[] = [];
  filteredVentas: Venta[] = [];
  loading = true;

  statusFilter: string = 'todos';
  searchQuery: string = '';

  // Manual sale state
  showCreateSaleModal = false;
  submittingSale = false;
  productos: Producto[] = [];
  ubigeos: Ubigeo[] = [];
  
  departamentos: Ubigeo[] = [];
  provincias: Ubigeo[] = [];
  distritos: Ubigeo[] = [];

  selectedDpto: string = '';
  selectedProv: string = '';
  
  // Expanded sales states
  expandedSales: { [id: number]: boolean } = {};
  saleItemsMap: { [id: number]: any[] } = {};
  loadingDetails: { [id: number]: boolean } = {};
  
  saleForm = {
    clienteNombre: '',
    clienteTelefono: '',
    ubigeoId: '',
    direccionReferencia: '',
    estado: 'pendiente'
  };
  
  saleItems: {
    producto: Producto;
    variante: VarianteProducto;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[] = [];
  
  selectedProductId: number | null = null;
  selectedVarianteId: number | null = null;
  selectedQuantity: number = 1;
  selectedPrice: number = 0;
  availableVariantes: VarianteProducto[] = [];
  selectedVarianteMaxStock: number = 0;

  constructor(
    private ventaService: VentaService, 
    private productoService: ProductoService,
    private ubigeoService: UbigeoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.ubigeoService.getAllUbigeos().subscribe({
      next: (data: Ubigeo[]) => {
        this.ubigeos = data;
        this.departamentos = data.filter(u => u.codprov === '00' && u.coddist === '00');
        this.productoService.getProductos().subscribe({
          next: (prods: Producto[]) => {
            this.productos = prods;
            this.loadVentas();
          },
          error: (err: any) => {
            console.error('Error al cargar productos para ventas', err);
            this.loadVentas();
          }
        });
      },
      error: (err: any) => {
        console.error('Error al cargar ubigeos para ventas', err);
        this.loadVentas();
      }
    });
  }

  loadVentas(): void {
    this.loading = true;
    this.ventaService.getAllVentas().subscribe({
      next: (data) => {
        this.ventas = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar ventas', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getUbigeoName(ubigeoId: string): string {
    const u = this.ubigeos.find(x => x.id === ubigeoId);
    if (!u) return 'Desconocido';
    
    const dpto = this.ubigeos.find(x => x.coddpto === u.coddpto && x.codprov === '00' && x.coddist === '00');
    const prov = this.ubigeos.find(x => x.coddpto === u.coddpto && x.codprov === u.codprov && x.coddist === '00');
    
    let parts: string[] = [];
    parts.push(u.nombre);
    if (prov && prov.nombre !== u.nombre) {
      parts.push(prov.nombre);
    }
    if (dpto && dpto.nombre !== u.nombre && dpto.nombre !== prov?.nombre) {
      parts.push(dpto.nombre);
    }
    return parts.join(', ');
  }

  getVentasByStatus(status: string): Venta[] {
    return this.filteredVentas.filter(v => v.estado === status);
  }

  toggleSaleExpand(id: number): void {
    this.expandedSales[id] = !this.expandedSales[id];
    if (this.expandedSales[id] && !this.saleItemsMap[id]) {
      this.loadSaleDetails(id);
    }
    this.cdr.markForCheck();
  }

  loadSaleDetails(id: number): void {
    this.loadingDetails[id] = true;
    this.ventaService.getVentaDetalles(id).subscribe({
      next: (details) => {
        this.saleItemsMap[id] = details;
        this.loadingDetails[id] = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading sale details', err);
        this.loadingDetails[id] = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    this.filteredVentas = this.ventas.filter(v => {
      const matchStatus = this.statusFilter === 'todos' || v.estado === this.statusFilter;
      const query = this.searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        v.clienteNombre.toLowerCase().includes(query) || 
        v.clienteTelefono.includes(query);
      return matchStatus && matchSearch;
    });
  }

  updateStatus(id: number, newStatus: string): void {
    this.ventaService.updateVentaStatus(id, newStatus).subscribe({
      next: (updated) => {
        console.log(`Estado de venta #${id} actualizado a ${newStatus}`);
        const idx = this.ventas.findIndex(v => v.id === id);
        if (idx !== -1) {
          this.ventas[idx] = updated;
          this.applyFilters();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al actualizar estado de venta', err);
        alert(err.error?.message || 'Error al cambiar estado de la venta');
        this.loadVentas(); // Reload to revert UI state
      }
    });
  }

  openCreateSaleModal(): void {
    this.saleForm = {
      clienteNombre: '',
      clienteTelefono: '',
      ubigeoId: '',
      direccionReferencia: '',
      estado: 'pendiente'
    };
    this.saleItems = [];
    this.selectedDpto = '';
    this.selectedProv = '';
    this.provincias = [];
    this.distritos = [];
    this.resetSelectedItemFields();
    this.showCreateSaleModal = true;
    this.cdr.markForCheck();
  }

  onDptoChange(): void {
    this.selectedProv = '';
    this.saleForm.ubigeoId = '';
    this.provincias = this.ubigeos.filter(u => u.coddpto === this.selectedDpto && u.codprov !== '00' && u.coddist === '00');
    this.distritos = [];
    this.cdr.markForCheck();
  }

  onProvChange(): void {
    this.saleForm.ubigeoId = '';
    this.distritos = this.ubigeos.filter(u => u.coddpto === this.selectedDpto && u.codprov === this.selectedProv && u.coddist !== '00');
    this.cdr.markForCheck();
  }

  onDistChange(): void {
    this.cdr.markForCheck();
  }

  closeCreateSaleModal(): void {
    this.showCreateSaleModal = false;
    this.cdr.markForCheck();
  }

  resetSelectedItemFields(): void {
    this.selectedProductId = null;
    this.selectedVarianteId = null;
    this.selectedQuantity = 1;
    this.selectedPrice = 0;
    this.availableVariantes = [];
    this.selectedVarianteMaxStock = 0;
  }

  onProductSelect(productId: any): void {
    const parsedId = !productId || productId === 'null' ? null : Number(productId);
    this.selectedProductId = parsedId;
    this.selectedVarianteId = null;
    this.selectedQuantity = 1;
    this.selectedPrice = 0;
    this.availableVariantes = [];
    this.selectedVarianteMaxStock = 0;
    
    if (parsedId) {
      const prod = this.productos.find(p => p.id === parsedId);
      if (prod) {
        this.selectedPrice = prod.precioBase;
      }
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
    this.selectedQuantity = 1;
    
    if (parsedId) {
      const selected = this.availableVariantes.find(v => v.id === parsedId);
      this.selectedVarianteMaxStock = selected ? selected.stock : 0;
    } else {
      this.selectedVarianteMaxStock = 0;
    }
    this.cdr.markForCheck();
  }

  addItemToSale(): void {
    if (!this.selectedProductId || !this.selectedVarianteId) return;
    
    const product = this.productos.find(p => p.id === this.selectedProductId);
    const variante = this.availableVariantes.find(v => v.id === this.selectedVarianteId);
    
    if (!product || !variante) return;
    
    // Check if variant already added to sale
    const existingIndex = this.saleItems.findIndex(item => item.variante.id === variante.id);
    const newQty = (existingIndex !== -1 ? this.saleItems[existingIndex].cantidad : 0) + this.selectedQuantity;
    
    if (newQty > variante.stock) {
      alert(`No puedes agregar más de la cantidad en stock disponible (${variante.stock} unidades).`);
      return;
    }
    
    if (existingIndex !== -1) {
      this.saleItems[existingIndex].cantidad = newQty;
      this.saleItems[existingIndex].precioUnitario = this.selectedPrice;
      this.saleItems[existingIndex].subtotal = this.selectedPrice * newQty;
    } else {
      this.saleItems.push({
        producto: product,
        variante: variante,
        cantidad: this.selectedQuantity,
        precioUnitario: this.selectedPrice,
        subtotal: this.selectedPrice * this.selectedQuantity
      });
    }
    
    // Reset selection fields
    this.resetSelectedItemFields();
    this.cdr.markForCheck();
  }

  removeItemFromSale(index: number): void {
    this.saleItems.splice(index, 1);
    this.cdr.markForCheck();
  }

  getSaleSubtotal(): number {
    return this.saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getSaleDeliveryFee(): number {
    if (!this.saleForm.ubigeoId) return 0;
    const ubigeo = this.ubigeos.find(u => u.id === this.saleForm.ubigeoId);
    return ubigeo ? ubigeo.precioDelivery : 0;
  }

  submitManualSale(): void {
    if (this.saleItems.length === 0) return;
    
    this.submittingSale = true;
    
    const request = {
      clienteNombre: this.saleForm.clienteNombre,
      clienteTelefono: this.saleForm.clienteTelefono,
      ubigeoId: this.saleForm.ubigeoId,
      direccionReferencia: this.saleForm.direccionReferencia,
      estado: this.saleForm.estado,
      items: this.saleItems.map(item => ({
        varianteId: item.variante.id!,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      }))
    };
    
    this.ventaService.registrarVentaAdmin(request).subscribe({
      next: (venta) => {
        this.submittingSale = false;
        this.showCreateSaleModal = false;
        alert(`Pedido #LUMI-${venta.id} registrado con éxito.`);
        this.loadVentas();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al registrar venta manual', err);
        this.submittingSale = false;
        alert(err.error?.message || 'Error al procesar la venta manual.');
        this.cdr.markForCheck();
      }
    });
  }
}
