import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService, CartResponse } from '../../../core/services/carrito.service';
import { UbigeoService, Ubigeo } from '../../../core/services/ubigeo.service';
import { VentaService, CheckoutRequest, Venta } from '../../../core/services/venta.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <main class="checkout-container animate-fade-in">
      <div class="checkout-layout" *ngIf="!successOrder">
        <!-- Form Details -->
        <section class="form-section">
          <h2>Datos de Entrega</h2>
          <form (submit)="onSubmit()" class="checkout-form">
            <div class="form-group">
              <label for="nombre">Nombre Completo</label>
              <input type="text" id="nombre" name="nombre" [(ngModel)]="model.clienteNombre" required placeholder="Ingresa tu nombre y apellido" />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono / Celular</label>
              <input type="tel" id="telefono" name="telefono" [(ngModel)]="model.clienteTelefono" required placeholder="Ej: 987654321" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label for="dpto">Departamento</label>
                <select id="dpto" name="dpto" [(ngModel)]="selectedDpto" (change)="onDptoChange()" required>
                  <option value="" disabled selected>Departamento</option>
                  <option *ngFor="let d of departamentos" [value]="d.coddpto">{{ d.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="prov">Provincia</label>
                <select id="prov" name="prov" [(ngModel)]="selectedProv" (change)="onProvChange()" [disabled]="!selectedDpto" required>
                  <option value="" disabled selected>Provincia</option>
                  <option *ngFor="let p of provincias" [value]="p.codprov">{{ p.nombre }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="dist">Distrito</label>
                <select id="dist" name="ubigeo" [(ngModel)]="model.ubigeoId" (change)="onDistChange()" [disabled]="!selectedProv" required>
                  <option value="" disabled selected>Distrito</option>
                  <option *ngFor="let di of distritos" [value]="di.id">
                    {{ di.nombre }} (Envío: S/ {{ di.precioDelivery | number:'1.2-2' }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="direccion">Dirección y Referencia</label>
              <textarea id="direccion" name="direccion" [(ngModel)]="model.direccionReferencia" required rows="3" placeholder="Ej: Av. Larco 123 Dpto 401 (Frente al parque)"></textarea>
            </div>

            <button type="submit" [disabled]="submitting || !cart || cart.items.length === 0" class="place-order-btn">
              {{ submitting ? 'Procesando...' : 'Confirmar Pedido' }}
            </button>
          </form>
        </section>

        <!-- Order Summary -->
        <section class="summary-section">
          <h2>Resumen del Pedido</h2>
          <div class="summary-card">
            <div class="items-list" *ngIf="cart">
              <div *ngFor="let item of cart.items" class="summary-item">
                <div class="item-desc">
                  <span class="item-name">{{ item.productoNombre }}</span>
                  <span class="item-variant">Talla: {{ item.talla }} / Color: {{ item.color }} (x{{ item.cantidad }})</span>
                </div>
                <span class="item-subtotal">S/ {{ item.subtotal | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="pricing-details" *ngIf="cart">
              <div class="price-row">
                <span>Subtotal productos</span>
                <span>S/ {{ cart.total | number:'1.2-2' }}</span>
              </div>
              <div class="price-row">
                <span>Costo de envío</span>
                <span>{{ selectedDeliveryFee > 0 ? 'S/ ' + (selectedDeliveryFee | number:'1.2-2') : 'S/ 0.00' }}</span>
              </div>
              <div class="price-row total-row">
                <span>Total a pagar</span>
                <span class="final-price">S/ {{ (cart.total + selectedDeliveryFee) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Success Screen -->
      <div class="success-screen animate-fade-in" *ngIf="successOrder">
        <div class="success-card">
          <div class="success-icon">✓</div>
          <h1>¡Pedido Recibido!</h1>
          <p class="order-msg">Tu pedido ha sido registrado con éxito. Nos pondremos en contacto contigo pronto.</p>
          
          <div class="order-details">
            <p><strong>Código de Pedido:</strong> #LUMI-{{ successOrder.id }}</p>
            <p><strong>Cliente:</strong> {{ successOrder.clienteNombre }}</p>
            <p><strong>Total Pagado:</strong> S/ {{ successOrder.totalPagar | number:'1.2-2' }}</p>
            <p><strong>Destino:</strong> {{ successOrder.direccionReferencia }}</p>
          </div>

          <button routerLink="/" class="back-home-btn">Seguir Comprando</button>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 24px;
    }
    .checkout-layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 64px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .checkout-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
    .form-section h2, .summary-section h2 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .form-group input, .form-group select, .form-group textarea {
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 14px;
      background: var(--bg-surface);
      color: var(--text-primary);
      transition: var(--transition-fast);
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--text-primary);
    }
    .place-order-btn {
      background: var(--primary-base);
      color: var(--bg-surface);
      border: none;
      padding: 16px;
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
      margin-top: 12px;
    }
    .place-order-btn:hover:not([disabled]) {
      background: var(--primary-hover);
    }
    .place-order-btn:disabled {
      background: var(--text-muted);
      cursor: not-allowed;
    }
    .summary-card {
      background: var(--bg-card);
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 24px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-desc {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-name {
      font-size: 14px;
      font-weight: 600;
    }
    .item-variant {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .item-subtotal {
      font-size: 14px;
      font-weight: 700;
    }
    .pricing-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--text-secondary);
    }
    .total-row {
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .final-price {
      font-size: 20px;
      font-weight: 800;
      color: var(--accent-base);
    }
    .success-screen {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }
    .success-card {
      background: var(--bg-surface);
      box-shadow: var(--shadow-lg);
      border-radius: var(--radius-lg);
      padding: 48px 32px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      background: #10b981;
      color: white;
      border-radius: var(--radius-full);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .success-card h1 {
      font-size: 28px;
      font-weight: 700;
    }
    .order-msg {
      color: var(--text-secondary);
      font-size: 15px;
    }
    .order-details {
      background: var(--bg-card);
      width: 100%;
      padding: 20px;
      border-radius: var(--radius-md);
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
      border: 1px solid var(--border-color);
    }
    .back-home-btn {
      background: var(--primary-base);
      color: var(--bg-surface);
      border: none;
      padding: 14px 28px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 13px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
      text-decoration: none;
    }
    .back-home-btn:hover {
      background: var(--primary-hover);
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: CartResponse | null = null;
  ubigeos: Ubigeo[] = [];
  selectedDeliveryFee: number = 0;

  departamentos: Ubigeo[] = [];
  provincias: Ubigeo[] = [];
  distritos: Ubigeo[] = [];

  selectedDpto: string = '';
  selectedProv: string = '';

  model: CheckoutRequest = {
    clienteNombre: '',
    clienteTelefono: '',
    ubigeoId: '',
    direccionReferencia: ''
  };

  submitting: boolean = false;
  successOrder: Venta | null = null;

  constructor(
    private carritoService: CarritoService,
    private ubigeoService: UbigeoService,
    private ventaService: VentaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sesionId = this.carritoService.getSessionId();
    this.loadCart(sesionId);
    this.loadUbigeos();
  }

  loadCart(sesionId: string): void {
    this.carritoService.getCartDetails(sesionId).subscribe({
      next: (data) => {
        this.cart = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar carrito', err)
    });
  }

  loadUbigeos(): void {
    this.ubigeoService.getAllUbigeos().subscribe({
      next: (data) => {
        this.ubigeos = data;
        this.departamentos = data.filter(u => u.codprov === '00' && u.coddist === '00');
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar ubigeos', err)
    });
  }

  onDptoChange(): void {
    this.selectedProv = '';
    this.model.ubigeoId = '';
    this.provincias = this.ubigeos.filter(u => u.coddpto === this.selectedDpto && u.codprov !== '00' && u.coddist === '00');
    this.distritos = [];
    this.selectedDeliveryFee = 0;
    this.cdr.markForCheck();
  }

  onProvChange(): void {
    this.model.ubigeoId = '';
    this.distritos = this.ubigeos.filter(u => u.coddpto === this.selectedDpto && u.codprov === this.selectedProv && u.coddist !== '00');
    this.selectedDeliveryFee = 0;
    this.cdr.markForCheck();
  }

  onDistChange(): void {
    const selected = this.distritos.find(u => u.id === this.model.ubigeoId);
    this.selectedDeliveryFee = selected ? selected.precioDelivery : 0;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    const sesionId = this.carritoService.getSessionId();
    if (!this.cart || this.cart.items.length === 0) return;

    this.submitting = true;
    this.ventaService.checkout(sesionId, this.model).subscribe({
      next: (order) => {
        this.submitting = false;
        this.successOrder = order;
        this.cdr.markForCheck();
        // Trigger cart state refresh (should clear cart items)
        this.carritoService.refreshCart();
      },
      error: (err) => {
        console.error('Error al confirmar checkout', err);
        this.submitting = false;
        this.cdr.markForCheck();
        alert(err.error?.message || 'Hubo un error al procesar tu pedido. Por favor verifica el stock.');
      }
    });
  }
}
