import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { VentaService, Venta, DashboardResponse } from '../../../core/services/venta.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, FormsModule],
  template: `
    <div class="admin-layout animate-fade-in">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="content-header">
          <div>
            <h1>Resumen del Negocio</h1>
            <p>Métricas generales de la tienda de ropa LUMI</p>
          </div>
          
          <!-- Date Filter Controls -->
          <div class="date-filters-container">
            <div class="date-input-group">
              <label for="desde">Desde</label>
              <input type="date" id="desde" [(ngModel)]="desde" (change)="onDateChange()" class="filter-input" />
            </div>
            <div class="date-input-group">
              <label for="hasta">Hasta</label>
              <input type="date" id="hasta" [(ngModel)]="hasta" (change)="onDateChange()" class="filter-input" />
            </div>
          </div>
        </header>

        <div *ngIf="loading" class="loader-container">
          <span class="loader"></span>
        </div>

        <div *ngIf="!loading" class="dashboard-grid">
          <!-- Metric Cards -->
          <section class="metrics-row">
            <div class="metric-card">
              <span class="metric-label">Ingresos Totales</span>
              <span class="metric-value">S/ {{ stats?.totalRevenue | number:'1.2-2' }}</span>
              <span class="metric-trend">Monto total vendido</span>
            </div>

            <div class="metric-card">
              <span class="metric-label">Ventas Procesadas</span>
              <span class="metric-value">{{ stats?.totalSales }}</span>
              <span class="metric-trend">Pedidos confirmados</span>
            </div>

            <div class="metric-card">
              <span class="metric-label">Clientes Únicos</span>
              <span class="metric-value">{{ stats?.totalClients }}</span>
              <span class="metric-trend">Por número de teléfono</span>
            </div>
          </section>

          <!-- Analytics Charts and Details -->
          <section class="analytics-section">
            <!-- Left Column: Top 5 products chart (Vertical Bar Chart) -->
            <div class="analytics-card chart-card">
              <h3>Productos Más Vendidos (Top 5)</h3>
              
              <div class="chart-container-vertical" *ngIf="stats?.topProducts && stats!.topProducts!.length > 0; else emptyTopState">
                <!-- Y-Axis Gridlines (background) -->
                <div class="chart-y-axis-grid">
                  <div class="grid-line"></div>
                  <div class="grid-line"></div>
                  <div class="grid-line"></div>
                  <div class="grid-line"></div>
                </div>

                <!-- Bars Container -->
                <div class="bars-container">
                  <div class="vertical-bar-column" *ngFor="let p of stats?.topProducts">
                    <div class="bar-value-label">{{ p.cantidadVendida }} u.</div>
                    <div class="bar-track">
                      <div class="bar-fill-vertical" [style.height.%]="getBarPercentage(p.cantidadVendida)"></div>
                    </div>
                    <div class="bar-name-label" [title]="p.productoNombre">{{ p.productoNombre }}</div>
                  </div>
                </div>
              </div>

              <ng-template #emptyTopState>
                <div class="empty-analytics-state">No hay ventas registradas en este período.</div>
              </ng-template>
            </div>

            <!-- Right Column: Detail list of all sold products -->
            <div class="analytics-card list-card">
              <h3>Detalle de Ventas por Producto</h3>
              <div class="list-container" *ngIf="stats?.allProducts && stats!.allProducts!.length > 0; else emptyListState">
                <table class="analytics-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style="text-align: right;">Cant. Vendida</th>
                      <th style="text-align: right;">Total Recaudado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of stats?.allProducts">
                      <td><strong>{{ p.productoNombre }}</strong></td>
                      <td style="text-align: right;">{{ p.cantidadVendida }} u.</td>
                      <td style="text-align: right;">S/ {{ p.totalVendido | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #emptyListState>
                <div class="empty-analytics-state">No hay ventas registradas en este período.</div>
              </ng-template>
            </div>
          </section>

          <!-- Recent Orders -->
          <section class="orders-section">
            <div class="section-header">
              <h2>Pedidos Recientes</h2>
              <a routerLink="/admin/ventas" class="view-all">Ver todos</a>
            </div>

            <div class="table-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="recentVentas.length === 0">
                    <td colspan="5" class="empty-row">No hay pedidos registrados todavía.</td>
                  </tr>
                  <tr *ngFor="let v of recentVentas">
                    <td><strong>#LUMI-{{ v.id }}</strong></td>
                    <td>{{ v.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ v.clienteNombre }}</td>
                    <td>S/ {{ v.totalPagar | number:'1.2-2' }}</td>
                    <td>
                      <span class="status-badge" [class]="v.estado">
                        {{ v.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
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
    .date-filters-container {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .date-input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .date-input-group label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--admin-text-secondary);
    }
    .filter-input {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 8px 12px;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--admin-text-primary);
      transition: var(--transition-fast);
    }
    .filter-input:focus {
      outline: none;
      border-color: var(--admin-accent);
    }
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .metric-card {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }
    .metric-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--admin-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 800;
      color: var(--admin-text-primary);
    }
    .metric-trend {
      font-size: 12px;
      color: var(--admin-text-secondary);
    }
    .analytics-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    .analytics-card {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .analytics-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--admin-text-primary);
      margin: 0;
    }
    .chart-container-vertical {
      position: relative;
      height: 260px;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .chart-y-axis-grid {
      position: absolute;
      top: 20px;
      bottom: 60px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      z-index: 1;
    }
    .grid-line {
      width: 100%;
      border-top: 1px dashed var(--admin-border-color);
      opacity: 0.5;
    }
    .bars-container {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 100%;
      padding-bottom: 60px;
    }
    .vertical-bar-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      width: 16%;
      min-width: 50px;
    }
    .bar-value-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--admin-accent);
      margin-bottom: 6px;
      text-align: center;
      animation: fade-in 0.5s ease;
    }
    .bar-track {
      background: rgba(0, 0, 0, 0.03);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      height: 140px;
      width: 24px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.02);
    }
    .bar-fill-vertical {
      background: linear-gradient(180deg, var(--admin-accent), #a78bfa);
      width: 100%;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      height: 0;
    }
    .bar-name-label {
      position: absolute;
      bottom: 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--admin-text-secondary);
      text-align: center;
      width: 70px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transform: rotate(-12deg);
      transform-origin: top center;
    }
    .list-container {
      max-height: 320px;
      overflow-y: auto;
    }
    .analytics-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    .analytics-table th, .analytics-table td {
      padding: 12px 8px;
      border-bottom: 1px solid var(--admin-border-color);
    }
    .analytics-table th {
      font-weight: 700;
      color: var(--admin-text-secondary);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    .empty-analytics-state {
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--admin-text-secondary);
      font-size: 13px;
      min-height: 150px;
    }
    .orders-section {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .section-header h2 {
      font-size: 18px;
      font-weight: 700;
    }
    .view-all {
      font-size: 13px;
      color: var(--admin-accent);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition-fast);
    }
    .view-all:hover {
      text-decoration: underline;
    }
    .table-wrapper {
      overflow-x: auto;
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
    .empty-row {
      text-align: center;
      color: var(--admin-text-secondary);
      padding: 32px !important;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: var(--radius-full);
      letter-spacing: 0.05em;
    }
    .status-badge.pendiente {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }
    .status-badge.completado {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }
    .status-badge.cancelado {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }
    .status-badge.enviado {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
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
export class DashboardComponent implements OnInit {
  stats: DashboardResponse | null = null;
  recentVentas: Venta[] = [];
  loading = true;

  // Date filters
  desde: string = '';
  hasta: string = '';

  constructor(private ventaService: VentaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setDefaultMonthDates();
    this.loadDashboardData();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  setDefaultMonthDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.desde = this.formatDate(firstDay);
    this.hasta = this.formatDate(lastDay);
  }

  onDateChange(): void {
    this.loadDashboardData();
  }

  getBarPercentage(qty: number): number {
    if (!this.stats?.topProducts || this.stats.topProducts.length === 0) return 0;
    const maxQty = this.stats.topProducts[0].cantidadVendida;
    if (maxQty === 0) return 0;
    return (qty / maxQty) * 100;
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.ventaService.getDashboardStats(this.desde, this.hasta).subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.markForCheck();
        this.loadRecentSales();
      },
      error: (err) => {
        console.error('Error al cargar métricas de dashboard', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadRecentSales(): void {
    this.ventaService.getAllVentas().subscribe({
      next: (sales) => {
        // Get the 5 most recent sales (sorted by id desc)
        this.recentVentas = sales
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar ventas recientes', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
