import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { VentaService, Venta, DashboardResponse } from '../../../core/services/venta.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout animate-fade-in">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="content-header">
          <h1>Resumen del Negocio</h1>
          <p>Métricas generales de la tienda de ropa LUMI</p>
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

  constructor(private ventaService: VentaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Fetch stats and sales
    this.ventaService.getDashboardStats().subscribe({
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
