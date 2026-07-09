import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Ubigeo {
  id: string;
  coddpto: string;
  codprov: string;
  coddist: string;
  nombre: string;
  precioDelivery: number;
}

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private apiUrl = `${environment.apiUrl}/public/ubigeo`;

  constructor(private http: HttpClient) {}

  getAllUbigeos(): Observable<Ubigeo[]> {
    return this.http.get<Ubigeo[]>(this.apiUrl);
  }
}
