import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export interface Subcategoria {
  id?: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export interface Producto {
  id?: number;
  categoriaId: number;
  subcategoriaId?: number | null;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  imagenGeneralUrl?: string;
  fechaCreacion?: string;
  estado?: boolean;
}

export interface VarianteProducto {
  id?: number;
  productoId: number;
  talla: string;
  color: string;
  stock: number;
  sku: string;
  imagenUrl?: string;
  precio?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private publicUrl = `${environment.apiUrl}/public`;
  private adminUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Public Catalog
  getActiveCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.publicUrl}/categorias`);
  }

  getActiveSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.publicUrl}/subcategorias`);
  }

  getProductos(categoriaId?: number, subcategoriaId?: number, search?: string): Observable<Producto[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    if (subcategoriaId) {
      params = params.set('subcategoriaId', subcategoriaId.toString());
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Producto[]>(`${this.publicUrl}/productos`, { params });
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.publicUrl}/productos/${id}`);
  }

  getVariantesByProductoId(id: number): Observable<VarianteProducto[]> {
    return this.http.get<VarianteProducto[]>(`${this.publicUrl}/productos/${id}/variantes`);
  }

  // Admin Categories
  getAllCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.adminUrl}/categorias`);
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.adminUrl}/categorias`, categoria);
  }

  updateCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.adminUrl}/categorias`, categoria);
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/categorias/${id}`);
  }

  // Admin Subcategories
  getAllSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.adminUrl}/subcategorias`);
  }

  getSubcategoriasByCategoriaId(categoriaId: number): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.adminUrl}/categorias/${categoriaId}/subcategorias`);
  }

  getActiveSubcategoriasByCategoriaId(categoriaId: number): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.adminUrl}/categorias/${categoriaId}/subcategorias/activas`);
  }

  createSubcategoria(subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(`${this.adminUrl}/subcategorias`, subcategoria);
  }

  updateSubcategoria(subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.adminUrl}/subcategorias`, subcategoria);
  }

  deleteSubcategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/subcategorias/${id}`);
  }

  // Admin Products
  getAdminProductos(categoriaId?: number, subcategoriaId?: number, search?: string): Observable<Producto[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    if (subcategoriaId) {
      params = params.set('subcategoriaId', subcategoriaId.toString());
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Producto[]>(`${this.adminUrl}/productos`, { params });
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.adminUrl}/productos`, producto);
  }

  updateProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.adminUrl}/productos`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/productos/${id}`);
  }

  // Admin Variants
  createVariante(variante: VarianteProducto): Observable<VarianteProducto> {
    return this.http.post<VarianteProducto>(`${this.adminUrl}/productos/variantes`, variante);
  }

  updateVariante(variante: VarianteProducto): Observable<VarianteProducto> {
    return this.http.put<VarianteProducto>(`${this.adminUrl}/productos/variantes`, variante);
  }

  deleteVariante(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/productos/variantes/${id}`);
  }
}
