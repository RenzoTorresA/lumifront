import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CompraItem {
  varianteId: number;
  cantidad: number;
  precioCompra: number;
}

export interface CompraRequest {
  proveedor: string;
  comentarios: string;
  items: CompraItem[];
}

export interface Compra {
  id?: number;
  fecha: string;
  proveedor: string;
  totalPagar: number;
  comentarios: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private adminUrl = `${environment.apiUrl}/admin/compras`;

  constructor(private http: HttpClient) {}

  registrarCompra(request: CompraRequest): Observable<Compra> {
    return this.http.post<Compra>(this.adminUrl, request);
  }

  getAllCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.adminUrl);
  }

  getCompraById(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.adminUrl}/${id}`);
  }
}
