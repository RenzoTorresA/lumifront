import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService, CartResponse, CartItemResponse } from '../../../core/services/carrito.service';
import { UbigeoService, Ubigeo } from '../../../core/services/ubigeo.service';
import { VentaService, CheckoutRequest, Venta } from '../../../core/services/venta.service';
import { showErrorAlert } from '../../../shared/utils/swal.helper';

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
            
            <!-- Shipping Methods Toggle -->
            <div class="shipping-method-selector">
              <button type="button" 
                [class.active]="model.metodoEnvio === 'DELIVERY_LOCAL'"
                (click)="changeShippingMethod('DELIVERY_LOCAL')"
                class="method-btn">
                📍 Delivery Pucallpa
              </button>
              <button type="button" 
                [class.active]="model.metodoEnvio === 'RECOJO_TIENDA'"
                (click)="changeShippingMethod('RECOJO_TIENDA')"
                class="method-btn">
                🏪 Recojo en Tienda
              </button>
              <button type="button" 
                [class.active]="model.metodoEnvio === 'ENVIO_PROVINCIA'"
                (click)="changeShippingMethod('ENVIO_PROVINCIA')"
                class="method-btn">
                🚚 Envío a Provincias
              </button>
            </div>

            <!-- Helper Note according to selection -->
            <div class="shipping-note animate-pop" *ngIf="model.metodoEnvio">
              <span *ngIf="model.metodoEnvio === 'DELIVERY_LOCAL'" class="note-text info">
                💡 <strong>Zona céntrica delivery gratis</strong>. Otras zonas como Manantay o Yarinacocha tienen costo adicional dependiendo del lugar (coordinación posterior).
              </span>
              <span *ngIf="model.metodoEnvio === 'RECOJO_TIENDA'" class="note-text success">
                🏪 <strong>Retiro en tienda física</strong>. Costo de envío gratis. Puedes pasar a recoger tu pedido en nuestro local.
              </span>
              <span *ngIf="model.metodoEnvio === 'ENVIO_PROVINCIA'" class="note-text warning">
                📦 <strong>Envío nacional por Shalom</strong>. El costo final del envío varía según el destino y se cancela en la agencia al recoger tu producto.
              </span>
            </div>

            <div class="form-group">
              <label for="nombre">Nombre Completo</label>
              <input type="text" id="nombre" name="nombre" [(ngModel)]="model.clienteNombre" required placeholder="Ingresa tu nombre y apellido" />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono / Celular</label>
              <input type="tel" id="telefono" name="telefono" [(ngModel)]="model.clienteTelefono" required placeholder="Ej: 987654321" />
            </div>

            <div *ngIf="model.metodoEnvio === 'ENVIO_PROVINCIA'" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;" class="animate-pop">
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
                    {{ di.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group" *ngIf="model.metodoEnvio !== 'RECOJO_TIENDA'">
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
          <h1>¡Pedido Registrado!</h1>
          <p class="order-msg">Tu pedido quedó registrado y pendiente de pago. Ahora te llevamos a WhatsApp para coordinar el pago y la entrega.</p>

          <div class="order-details">
            <p><strong>Código de Pedido:</strong> #LUMI-{{ getOrderCode(successOrder) }}</p>
            <p><strong>Cliente:</strong> {{ successOrder.clienteNombre }}</p>
            <p><strong>Tipo de entrega:</strong> {{ getShippingMethodLabel() }}</p>
            <p><strong>Subtotal productos:</strong> S/ {{ orderSubtotal | number:'1.2-2' }}</p>
            <p *ngIf="model.metodoEnvio !== 'RECOJO_TIENDA'"><strong>Dirección y referencia:</strong> {{ model.direccionReferencia }}</p>
            <p class="order-state-note"><strong>Estado:</strong> Pendiente de pago</p>
          </div>

          <div class="success-actions">
            <button type="button" class="whatsapp-btn" (click)="openWhatsAppCheckout()">Continuar por WhatsApp</button>
            <button routerLink="/" class="back-home-btn">Seguir Comprando</button>
          </div>
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
    .order-state-note {
      color: #b45309;
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
    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .whatsapp-btn, .back-home-btn {
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
      width: 100%;
      box-sizing: border-box;
    }
    .whatsapp-btn {
      background: #25d366;
      color: #fff;
    }
    .whatsapp-btn:hover {
      background: #1fb857;
    }
    .back-home-btn {
      background: var(--primary-base);
      color: var(--bg-surface);
    }
    .back-home-btn:hover {
      background: var(--primary-hover);
    }
    .shipping-method-selector {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .method-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px 8px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-fast);
      text-align: center;
      color: var(--text-primary);
    }
    .method-btn:hover {
      border-color: var(--text-primary);
    }
    .method-btn.active {
      background: var(--text-primary);
      color: var(--bg-surface);
      border-color: var(--text-primary);
    }
    .shipping-note {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      margin-bottom: 16px;
    }
    .note-text {
      font-size: 13px;
      line-height: 1.5;
      display: block;
    }
    .note-text.info {
      color: var(--text-primary);
    }
    .note-text.success {
      color: #047857;
    }
    .note-text.warning {
      color: #b45309;
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
  readonly whatsappNumber = '51918413620';
  orderedItems: CartItemResponse[] = [];
  orderSubtotal: number = 0;
  pendingWhatsAppUrl: string = '';

  model: CheckoutRequest = {
    clienteNombre: '',
    clienteTelefono: '',
    ubigeoId: '250101',
    direccionReferencia: '',
    metodoEnvio: 'DELIVERY_LOCAL'
  };

  submitting: boolean = false;
  successOrder: Venta | null = null;

  constructor(
    private carritoService: CarritoService,
    private ubigeoService: UbigeoService,
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carritoService.cart$.subscribe(cart => {
      this.cart = cart;
      this.cdr.markForCheck();
    });
    this.carritoService.refreshCart();
    this.loadUbigeos();
    
    // Set default shipping values
    this.model.metodoEnvio = 'DELIVERY_LOCAL';
    this.model.ubigeoId = '250101';
    this.selectedDeliveryFee = 0;
  }

  changeShippingMethod(method: string): void {
    this.model.metodoEnvio = method;
    if (method === 'RECOJO_TIENDA') {
      this.selectedDeliveryFee = 0;
      this.model.ubigeoId = '';
    } else if (method === 'DELIVERY_LOCAL') {
      this.selectedDeliveryFee = 0;
      this.model.ubigeoId = '250101'; // Calleria / Pucallpa
    } else if (method === 'ENVIO_PROVINCIA') {
      this.model.ubigeoId = '';
      this.selectedDeliveryFee = 0;
      this.selectedDpto = '';
      this.selectedProv = '';
      this.distritos = [];
    }
    this.cdr.markForCheck();
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
    if (this.model.metodoEnvio === 'ENVIO_PROVINCIA') {
      this.selectedDeliveryFee = 0;
    } else {
      const selected = this.distritos.find(u => u.id === this.model.ubigeoId);
      this.selectedDeliveryFee = selected ? Number(selected.precioDelivery) : 0;
    }
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    const sesionId = this.carritoService.getSessionId();
    if (!this.cart || this.cart.items.length === 0) return;

    const cartSnapshot = this.cart;
    this.submitting = true;
    this.ventaService.checkout(sesionId, this.model).subscribe({
      next: (order) => {
        this.submitting = false;
        this.orderedItems = cartSnapshot.items.map(item => ({ ...item }));
        this.orderSubtotal = cartSnapshot.total;
        this.successOrder = order;
        this.pendingWhatsAppUrl = this.buildWhatsAppUrl(order);
        this.cdr.markForCheck();
        this.openWhatsAppCheckout();
        this.carritoService.refreshCart();
      },
      error: (err) => {
        console.error('Error al confirmar checkout', err);
        this.submitting = false;
        this.cdr.markForCheck();
        void showErrorAlert('No se pudo registrar el pedido', err.error?.message || 'Hubo un error al procesar tu pedido. Por favor verifica el stock.');
      }
    });
  }

  getOrderCode(order: Venta): number | string {
    return order.numeroComprobante || order.id || '';
  }

  getShippingMethodLabel(): string {
    switch (this.model.metodoEnvio) {
      case 'RECOJO_TIENDA':
        return 'Recojo en tienda';
      case 'ENVIO_PROVINCIA':
        return 'Envío a provincia';
      default:
        return 'Delivery Pucallpa';
    }
  }

  openWhatsAppCheckout(): void {
    if (!this.pendingWhatsAppUrl) return;
    globalThis.open?.(this.pendingWhatsAppUrl, '_blank');
  }

  private buildWhatsAppUrl(order: Venta): string {
    const message = this.buildWhatsAppMessage(order);
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  private buildWhatsAppMessage(order: Venta): string {
    const lines: string[] = [
      'Hola, acabo de registrar un pedido en Lumi Store.',
      '',
      `Pedido: #LUMI-${this.getOrderCode(order)}`,
      `Cliente: ${order.clienteNombre}`,
      `Teléfono: ${order.clienteTelefono}`,
      '',
      `Tipo de entrega: ${this.getShippingMethodLabel()}`
    ];

    if (this.model.metodoEnvio === 'DELIVERY_LOCAL') {
      lines.push(`Dirección y referencia: ${order.direccionReferencia}`);
    }

    if (this.model.metodoEnvio === 'ENVIO_PROVINCIA') {
      lines.push(`Departamento: ${this.getDepartmentName()}`);
      lines.push(`Provincia: ${this.getProvinceName()}`);
      lines.push(`Distrito: ${this.getDistrictName(order.ubigeoId)}`);
      lines.push(`Dirección y referencia: ${order.direccionReferencia}`);
    }

    lines.push('', 'Productos:');
    this.orderedItems.forEach(item => {
      lines.push(`- ${item.productoNombre} / Talla ${item.talla} / Color ${item.color} / Cant. ${item.cantidad}`);
    });

    lines.push('', `Subtotal: S/ ${this.orderSubtotal.toFixed(2)}`);

    switch (this.model.metodoEnvio) {
      case 'RECOJO_TIENDA':
        lines.push('Recojo en tienda sin costo adicional.');
        break;
      case 'ENVIO_PROVINCIA':
        lines.push('📦 Envío nacional por Shalom. El costo final del envío varía según el destino.');
        break;
      default:
        lines.push('Zona céntrica delivery gratis. Otras zonas como Manantay o Yarinacocha tienen costo adicional dependiendo del lugar.');
        break;
    }

    lines.push('', 'Quedo atento(a) a los datos para realizar el pago por Yape o transferencia.');

    return lines.join('\n');
  }

  private getDepartmentName(): string {
    const ubigeo = this.ubigeos.find(u => u.coddpto === this.selectedDpto && u.codprov === '00' && u.coddist === '00');
    return ubigeo?.nombre || '';
  }

  private getProvinceName(): string {
    const ubigeo = this.provincias.find(u => u.codprov === this.selectedProv);
    return ubigeo?.nombre || '';
  }

  private getDistrictName(ubigeoId: string): string {
    return this.ubigeos.find(u => u.id === ubigeoId)?.nombre || '';
  }
}

