import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItemResponse {
  detalleId: number;
  varianteId: number;
  productoId: number;
  productoNombre: string;
  talla: string;
  color: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stockDisponible: number;
}

export interface CartResponse {
  carritoId: number;
  sesionId: string;
  items: CartItemResponse[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = `${environment.apiUrl}/public/carrito`;
  
  // Reactive state for the shopping cart
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Helper to retrieve or create local session ID
  getSessionId(): string {
    let sesionId = localStorage.getItem('lumi_session_id');
    if (!sesionId) {
      sesionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('lumi_session_id', sesionId);
    }
    return sesionId;
  }

  getCartDetails(sesionId: string): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/${sesionId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItemToCart(sesionId: string, varianteId: number, cantidad: number): Observable<CartResponse> {
    let params = new HttpParams()
      .set('varianteId', varianteId.toString())
      .set('cantidad', cantidad.toString());
    return this.http.post<CartResponse>(`${this.apiUrl}/${sesionId}`, {}, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateItemQuantity(sesionId: string, varianteId: number, cantidad: number): Observable<CartResponse> {
    let params = new HttpParams()
      .set('varianteId', varianteId.toString())
      .set('cantidad', cantidad.toString());
    return this.http.put<CartResponse>(`${this.apiUrl}/${sesionId}`, {}, { params }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(sesionId: string, varianteId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/${sesionId}/${varianteId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // Manually trigger cart update
  refreshCart(): void {
    const sesionId = this.getSessionId();
    this.getCartDetails(sesionId).subscribe();
  }
}
