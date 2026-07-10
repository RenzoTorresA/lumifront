import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CheckoutRequest {
  clienteNombre: string;
  clienteTelefono: string;
  ubigeoId: string;
  direccionReferencia: string;
}

export interface AdminCheckoutItem {
  varianteId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface AdminCheckoutRequest {
  clienteNombre: string;
  clienteTelefono: string;
  ubigeoId: string;
  direccionReferencia: string;
  fechaEnvioProgramada?: string | null;
  estado: string;
  items: AdminCheckoutItem[];
}

export interface Venta {
  id?: number;
  numeroComprobante?: number;
  fecha: string;
  fechaEnvioProgramada?: string | null;
  totalProductos: number;
  costoDelivery: number;
  totalPagar: number;
  estado: string;
  clienteNombre: string;
  clienteTelefono: string;
  ubigeoId: string;
  direccionReferencia: string;
}

export interface VentaFilters {
  estado?: string;
  cliente?: string;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  fechaEnvioDesde?: string;
  fechaEnvioHasta?: string;
}

export interface VentaDetalleDTO {
  varianteId: number;
  cantidad: number;
  precioUnitario: number;
  productoNombre: string;
  sku: string;
  talla: string;
  color: string;
}

export interface DashboardResponse {
  totalSales: number;
  totalRevenue: number;
  totalClients: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private publicUrl = `${environment.apiUrl}/public/checkout`;
  private adminUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  checkout(sesionId: string, request: CheckoutRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.publicUrl}/${sesionId}`, request);
  }

  getAllVentas(filters?: VentaFilters): Observable<Venta[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<Venta[]>(`${this.adminUrl}/ventas`, { params });
  }

  registrarVentaAdmin(request: AdminCheckoutRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.adminUrl}/ventas`, request);
  }

  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.adminUrl}/ventas/${id}`);
  }

  getVentaDetalles(id: number): Observable<VentaDetalleDTO[]> {
    return this.http.get<VentaDetalleDTO[]>(`${this.adminUrl}/ventas/${id}/detalles`);
  }

  updateVentaStatus(id: number, estado: string): Observable<Venta> {
    const params = new HttpParams().set('estado', estado);
    return this.http.patch<Venta>(`${this.adminUrl}/ventas/${id}/estado`, {}, { params });
  }

  updateFechaEnvioProgramada(id: number, fechaEnvioProgramada: string | null): Observable<Venta> {
    return this.http.patch<Venta>(
      `${this.adminUrl}/ventas/${id}/fecha-envio-programada`,
      { fechaEnvioProgramada }
    );
  }

  getDashboardStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.adminUrl}/dashboard`);
  }
}
