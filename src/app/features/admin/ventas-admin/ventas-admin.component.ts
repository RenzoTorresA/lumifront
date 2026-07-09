import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { VentaService, Venta } from '../../../core/services/venta.service';

@Component({
  selector: 'app-ventas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout animate-fade-in">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="content-header">
          <h1>Gestión de Ventas y Pedidos</h1>
          <p>Supervisa las órdenes de compra y actualiza los estados de despacho</p>
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

          <!-- Orders Table -->
          <div class="table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Total</th>
                  <th>Despacho</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredVentas.length === 0">
                  <td colspan="7" class="empty-row">No se encontraron pedidos coincidentes.</td>
                </tr>
                <tr *ngFor="let v of filteredVentas">
                  <td><strong>#LUMI-{{ v.id }}</strong></td>
                  <td>{{ v.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ v.clienteNombre }}</td>
                  <td>{{ v.clienteTelefono }}</td>
                  <td>
                    <div class="price-detail">S/ {{ v.totalPagar | number:'1.2-2' }}</div>
                    <span class="delivery-cost">(Delivery: S/ {{ v.costoDelivery | number:'1.2-2' }})</span>
                  </td>
                  <td>
                    <div class="shipping-address">{{ v.direccionReferencia }}</div>
                  </td>
                  <td>
                    <select [ngModel]="v.estado" (change)="updateStatus(v.id!, $any($event.target).value)" class="status-select" [class]="v.estado">
                      <option value="pendiente">pendiente</option>
                      <option value="enviado">enviado</option>
                      <option value="completado">completado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
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
      background: rgba(255, 255, 255, 0.02);
    }
    .price-detail {
      font-weight: 700;
    }
    .delivery-cost {
      font-size: 11px;
      color: var(--admin-text-secondary);
    }
    .shipping-address {
      max-width: 240px;
      font-size: 13px;
      color: var(--admin-text-secondary);
      word-break: break-word;
    }
    .status-select {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: var(--radius-full);
      border: 1px solid transparent;
      outline: none;
      cursor: pointer;
      font-family: var(--font-body);
      transition: var(--transition-fast);
    }
    .status-select.pendiente {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.3);
    }
    .status-select.completado {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .status-select.cancelado {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.3);
    }
    .status-select.enviado {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.3);
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
  `]
})
export class VentasAdminComponent implements OnInit {
  ventas: Venta[] = [];
  filteredVentas: Venta[] = [];
  loading = true;

  statusFilter: string = 'todos';
  searchQuery: string = '';

  constructor(private ventaService: VentaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadVentas();
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
}
