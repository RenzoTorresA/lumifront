import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { ProductoService, Producto, Categoria, VarianteProducto, Subcategoria } from '../../../core/services/producto.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout animate-fade-in">
      <app-admin-sidebar></app-admin-sidebar>
      
      <main class="main-content">
        <header class="content-header">
          <h1>Inventario y Catálogo</h1>
          <p>Gestiona los productos, categorías e inventario de variantes</p>
        </header>

        <!-- Tabs -->
        <div class="tabs">
          <button [class.active]="activeTab === 'productos'" (click)="setTab('productos')" class="tab-btn">Productos</button>
          <button [class.active]="activeTab === 'categorias'" (click)="setTab('categorias')" class="tab-btn">Categorías</button>
        </div>

        <div *ngIf="loading" class="loader-container">
          <span class="loader"></span>
        </div>

        <div *ngIf="!loading" class="tab-content">
          
          <!-- ================= TAB: PRODUCTOS ================= -->
          <div *ngIf="activeTab === 'productos'" class="products-tab">
            <div class="action-bar">
              <h2>Listado de Prendas</h2>
              <button (click)="openProductModal()" class="action-btn">+ Nuevo Producto</button>
            </div>

            <div class="table-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio Base</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="productos.length === 0">
                    <td colspan="5" class="empty-row">No hay productos creados.</td>
                  </tr>
                  <ng-container *ngFor="let p of productos">
                    <tr>
                      <td>
                        <img [src]="p.imagenGeneralUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop'" [alt]="p.nombre" class="thumb" />
                      </td>
                      <td>
                        <strong>{{ p.nombre }}</strong>
                        <div class="desc-short">{{ p.descripcion }}</div>
                      </td>
                      <td>
                        <div>{{ getCategoryName(p.categoriaId) }}</div>
                        <small *ngIf="p.subcategoriaId" class="text-xs" style="color: var(--admin-text-secondary); display: block; margin-top: 2px;">
                          ↳ {{ getSubcategoryName(p.subcategoriaId) }}
                        </small>
                      </td>
                      <td>S/ {{ p.precioBase | number:'1.2-2' }}</td>
                      <td class="action-cells">
                        <button (click)="toggleProductExpand(p)" class="btn-secondary">
                          {{ expandedProducts[p.id!] ? 'Ocultar stock' : 'Ver stock' }}
                        </button>
                        <button (click)="openProductModal(p)" class="btn-edit">Editar</button>
                        <button (click)="deleteProducto(p.id!)" class="btn-delete">Eliminar</button>
                      </td>
                    </tr>
                    <tr *ngIf="expandedProducts[p.id!]">
                      <td colspan="5" class="expanded-row-td">
                        <div class="variants-inline-container animate-fade-in">
                          <div *ngIf="loadingVariants[p.id!]" class="loader-sm-container">
                            <span class="loader-sm"></span>
                          </div>
                          
                          <div *ngIf="!loadingVariants[p.id!] && productVariantsMap[p.id!]" class="variants-inline-content">
                            <div class="inline-header-row">
                              <h4>Variantes e Inventario: {{ p.nombre }}</h4>
                              <button (click)="openVariantsModal(p)" class="btn-manage-variants">
                                ⚙️ Gestionar Variantes
                              </button>
                            </div>
                            
                            <table class="variants-inline-table">
                              <thead>
                                <tr>
                                  <th>Imagen</th>
                                  <th>SKU</th>
                                  <th>Talla</th>
                                  <th>Color</th>
                                  <th>Stock</th>
                                  <th>Precio</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr *ngIf="productVariantsMap[p.id!].length === 0">
                                  <td colspan="6" class="empty-inline-row">No hay variantes creadas para este producto.</td>
                                </tr>
                                <tr *ngFor="let v of productVariantsMap[p.id!]">
                                  <td>
                                    <img *ngIf="v.imagenUrl" [src]="v.imagenUrl" [alt]="v.sku" class="variant-thumb" />
                                    <span *ngIf="!v.imagenUrl" class="no-img-text">-</span>
                                  </td>
                                  <td><code class="sku-code">{{ v.sku }}</code></td>
                                  <td><strong>{{ v.talla }}</strong></td>
                                  <td>{{ v.color }}</td>
                                  <td>
                                    <span class="stock-badge">{{ v.stock }}</span>
                                  </td>
                                  <td>
                                    <span *ngIf="v.precio">S/ {{ v.precio | number:'1.2-2' }}</span>
                                    <span *ngIf="!v.precio" style="color: var(--admin-text-secondary); font-size: 11px;">(Base)</span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ================= TAB: CATEGORIAS ================= -->
          <div *ngIf="activeTab === 'categorias'" class="categories-tab">
            <div class="action-bar">
              <h2>Listado de Categorías</h2>
              <button (click)="openCategoryModal()" class="action-btn">+ Nueva Categoría</button>
            </div>

            <div class="table-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="categorias.length === 0">
                    <td colspan="4" class="empty-row">No hay categorías creadas.</td>
                  </tr>
                  <ng-container *ngFor="let c of categorias">
                    <tr>
                      <td><strong>{{ c.nombre }}</strong></td>
                      <td>{{ c.descripcion || '-' }}</td>
                      <td>
                        <span class="status-indicator" [class.active]="c.estado">
                          {{ c.estado ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="action-cells">
                        <button (click)="toggleCategoryExpand(c)" class="btn-secondary btn-sm">
                          {{ expandedCategories[c.id!] ? 'Ocultar subs' : 'Subcategorías' }}
                        </button>
                        <button (click)="openCategoryModal(c)" class="btn-edit btn-sm">Editar</button>
                        <button (click)="deleteCategoria(c.id!)" class="btn-delete btn-sm">Eliminar</button>
                      </td>
                    </tr>
                    <tr *ngIf="expandedCategories[c.id!]">
                      <td colspan="4" class="expanded-row-td">
                        <div class="variants-inline-container animate-fade-in">
                          <div class="inline-header-row">
                            <h4>Subcategorías de {{ c.nombre }}</h4>
                            <button (click)="openSubcategoryModal(c)" class="btn-manage-variants">
                              + Nueva Subcategoría
                            </button>
                          </div>
                          
                          <table class="variants-inline-table">
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr *ngIf="!categorySubcategoriasMap[c.id!] || categorySubcategoriasMap[c.id!].length === 0">
                                <td colspan="4" class="empty-inline-row">No hay subcategorías asociadas a esta categoría.</td>
                              </tr>
                              <tr *ngFor="let sub of categorySubcategoriasMap[c.id!]">
                                <td><strong>{{ sub.nombre }}</strong></td>
                                <td>{{ sub.descripcion || '-' }}</td>
                                <td>
                                  <span class="status-indicator" [class.active]="sub.estado">
                                    {{ sub.estado ? 'Activa' : 'Inactiva' }}
                                  </span>
                                </td>
                                <td class="action-cells">
                                  <button (click)="openSubcategoryModal(c, sub)" class="btn-edit btn-sm">Editar</button>
                                  <button (click)="deleteSubcategory(sub.id!, c.id!)" class="btn-delete btn-sm">Eliminar</button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- ================= MODAL: CATEGORIA ================= -->
      <div class="modal-overlay" *ngIf="showCategoryModal" (click)="closeCategoryModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editingCategory?.id ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
          <form (submit)="saveCategory()" class="modal-form">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="categoryForm.nombre" name="catNombre" required />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="categoryForm.descripcion" name="catDesc" rows="3"></textarea>
            </div>
            <div class="form-group-row">
              <input type="checkbox" id="catEstado" [(ngModel)]="categoryForm.estado" name="catEstado" />
              <label for="catEstado">Categoría Activa</label>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeCategoryModal()" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= MODAL: SUBCATEGORIA ================= -->
      <div class="modal-overlay" *ngIf="showSubcategoryModal" (click)="closeSubcategoryModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editingSubcategory?.id ? 'Editar Subcategoría' : 'Nueva Subcategoría' }}</h3>
          <p style="font-size: 13px; color: var(--admin-text-secondary); margin-top: -16px; margin-bottom: 20px;">
            Asociada a la categoría: <strong>{{ selectedCategoryForSubcategory?.nombre }}</strong>
          </p>
          <form (submit)="saveSubcategory()" class="modal-form">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="subcategoryForm.nombre" name="subNombre" required />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="subcategoryForm.descripcion" name="subDesc" rows="3"></textarea>
            </div>
            <div class="form-group-row">
              <input type="checkbox" id="subEstado" [(ngModel)]="subcategoryForm.estado" name="subEstado" />
              <label for="subEstado">Subcategoría Activa</label>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeSubcategoryModal()" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= MODAL: PRODUCTO ================= -->
      <div class="modal-overlay" *ngIf="showProductModal" (click)="closeProductModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editingProduct?.id ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <form (submit)="saveProduct()" class="modal-form">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="productForm.nombre" name="prodNombre" required />
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="productForm.categoriaId" name="prodCat" required (change)="onCategoryChange()">
                <option value="" disabled>Selecciona una categoría</option>
                <option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="productForm.categoriaId">
              <label>Subcategoría</label>
              <select [(ngModel)]="productForm.subcategoriaId" name="prodSubCat">
                <option [value]="null">Ninguna</option>
                <option *ngFor="let sub of getSubcategoriasForSelectedCategory(productForm.categoriaId)" [value]="sub.id">
                  {{ sub.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Precio Base (S/)</label>
              <input type="number" [(ngModel)]="productForm.precioBase" name="prodPrecio" required step="0.01" />
            </div>
            <div class="form-group">
              <label>URL de Imagen</label>
              <input type="text" [(ngModel)]="productForm.imagenGeneralUrl" name="prodImg" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="productForm.descripcion" name="prodDesc" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeProductModal()" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= MODAL: VARIANTES ================= -->
      <div class="modal-overlay" *ngIf="showVariantsModal" (click)="closeVariantsModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <h3>Gestionar Variantes y Stock: {{ selectedProductForVariants?.nombre }}</h3>
          
          <div class="variant-management-layout">
            <!-- Form to add new variant -->
            <form (submit)="saveVariant()" class="add-variant-form">
              <h4>{{ editingVariant ? 'Editar Variante' : 'Agregar Variante' }}</h4>
              <div class="form-group">
                <label>Talla</label>
                <input type="text" [(ngModel)]="variantForm.talla" name="vTalla" required placeholder="Ej: S, M, L, XL" />
              </div>
              <div class="form-group">
                <label>Color</label>
                <input type="text" [(ngModel)]="variantForm.color" name="vColor" required placeholder="Ej: Negro, Blanco" />
              </div>
              <div class="form-group">
                <label>{{ editingVariant ? 'Stock' : 'Stock Inicial' }}</label>
                <input type="number" [(ngModel)]="variantForm.stock" name="vStock" required min="0" />
              </div>
              <div class="form-group">
                <label>SKU</label>
                <input type="text" [(ngModel)]="variantForm.sku" name="vSku" required placeholder="Ej: PROD-BLK-S" />
              </div>
              <div class="form-group">
                <label>URL de Imagen (Opcional)</label>
                <input type="text" [(ngModel)]="variantForm.imagenUrl" name="vImagenUrl" placeholder="https://ejemplo.com/imagen.jpg" />
              </div>
              <div class="form-group">
                <label>Precio Especial (Opcional) (S/)</label>
                <input type="number" step="0.01" [(ngModel)]="variantForm.precio" name="vPrecio" placeholder="Por defecto: Precio base" />
              </div>
              <div class="variant-form-actions">
                <button type="submit" class="btn-save">{{ editingVariant ? 'Actualizar' : '+ Agregar' }}</button>
                <button *ngIf="editingVariant" type="button" (click)="cancelEditVariant()" class="btn-cancel btn-sm">Cancelar</button>
              </div>
            </form>

            <!-- Variants table -->
            <div class="variants-table-wrapper">
              <h4>Existencias Actuales</h4>
              <table class="admin-table text-xs">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>SKU</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="variantes.length === 0">
                    <td colspan="6" class="empty-row">No hay variantes creadas para este producto.</td>
                  </tr>
                  <tr *ngFor="let v of variantes">
                    <td>
                      <img *ngIf="v.imagenUrl" [src]="v.imagenUrl" alt="Mini" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);" />
                      <span *ngIf="!v.imagenUrl" style="color: #6b7280;">-</span>
                    </td>
                    <td>{{ v.sku }}</td>
                    <td><strong>{{ v.talla }}</strong></td>
                    <td>{{ v.color }}</td>
                    <td>
                      <span class="stock-badge">{{ v.stock }}</span>
                    </td>
                    <td>
                      <span *ngIf="v.precio">S/ {{ v.precio | number:'1.2-2' }}</span>
                      <span *ngIf="!v.precio" style="color: var(--admin-text-secondary); font-size: 11px;">(Base)</span>
                    </td>
                    <td class="action-cells">
                      <button (click)="editVariant(v)" class="btn-edit btn-sm">Editar</button>
                      <button (click)="deleteVariant(v.id!)" class="btn-delete btn-sm">Eliminar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="modal-footer">
            <button (click)="closeVariantsModal()" class="btn-cancel">Cerrar</button>
          </div>
        </div>
      </div>

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
    .tabs {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--admin-border-color);
      padding-bottom: 12px;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 8px 16px;
      color: var(--admin-text-secondary);
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: var(--transition-fast);
    }
    .tab-btn:hover, .tab-btn.active {
      color: var(--admin-text-primary);
      background: var(--admin-bg-surface);
    }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .action-bar h2 {
      font-size: 20px;
      font-weight: 700;
    }
    .action-btn {
      background: var(--admin-accent);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .action-btn:hover {
      background: var(--admin-accent-hover);
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
      background: rgba(0, 0, 0, 0.02);
    }
    .thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .desc-short {
      font-size: 12px;
      color: var(--admin-text-secondary);
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .status-indicator {
      display: inline-block;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      border-radius: var(--radius-full);
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }
    .status-indicator.active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }
    .action-cells {
      display: flex;
      gap: 8px;
    }
    .btn-secondary, .btn-edit, .btn-delete {
      border: none;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
      transition: var(--transition-fast);
    }
    .btn-secondary {
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
      border: 1px solid var(--admin-border-color);
    }
    .btn-secondary:hover {
      background: var(--admin-border-color);
    }
    .btn-edit {
      background: rgba(59, 130, 246, 0.1);
      color: var(--admin-accent);
    }
    .btn-edit:hover {
      background: rgba(59, 130, 246, 0.2);
    }
    .btn-delete {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    .empty-row {
      text-align: center;
      color: var(--admin-text-secondary);
      padding: 32px !important;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 300;
    }
    .modal {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-lg);
      padding: 32px;
      max-width: 500px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      color: var(--admin-text-primary);
    }
    .modal-lg {
      max-width: 1000px;
      width: 90%;
    }
    .modal h3 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    .modal-form {
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
      color: var(--admin-text-secondary);
    }
    .form-group input, .form-group select, .form-group textarea {
      padding: 12px;
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
      font-family: var(--font-body);
      font-size: 14px;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--admin-accent);
    }
    .form-group-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
    }
    .btn-cancel, .btn-save {
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-body);
    }
    .btn-cancel {
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
      border: 1px solid var(--admin-border-color);
    }
    .btn-save {
      background: var(--admin-accent);
      color: white;
    }
    .btn-save:hover {
      background: var(--admin-accent-hover);
    }

    /* Variant layouts */
    .variant-management-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 20px;
      align-items: start;
    }
    .add-variant-form {
      background: var(--admin-bg-base);
      border: 1px solid var(--admin-border-color);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .variant-form-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .add-variant-form h4, .variants-table-wrapper h4 {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .variants-table-wrapper {
      flex: 1;
      overflow-x: auto;
    }
    .text-xs th, .text-xs td {
      padding: 8px 8px !important;
      font-size: 12px;
    }
    .stock-input {
      width: 70px;
      padding: 6px !important;
      text-align: center;
    }
    .btn-sm {
      padding: 4px 8px !important;
      font-size: 11px !important;
    }
    .modal-footer {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--admin-border-color);
      padding-top: 16px;
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
    .expanded-row-td {
      padding: 0 !important;
      background: rgba(148, 163, 184, 0.03);
    }
    .variants-inline-container {
      padding: 20px;
      border-bottom: 1px solid var(--admin-border-color);
    }
    .loader-sm-container {
      display: flex;
      justify-content: center;
      padding: 12px 0;
    }
    .loader-sm {
      width: 20px;
      height: 20px;
      border: 2px solid var(--admin-border-color);
      border-radius: 50%;
      border-top-color: var(--admin-accent);
      animation: spin 1s linear infinite;
    }
    .variants-inline-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .inline-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .inline-header-row h4 {
      font-size: 14px;
      font-weight: 700;
      color: var(--admin-text-primary);
      margin: 0;
    }
    .btn-manage-variants {
      background: none;
      border: 1px dashed var(--admin-border-color);
      color: var(--admin-text-secondary);
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .btn-manage-variants:hover {
      background: var(--admin-bg-base);
      color: var(--admin-text-primary);
      border-color: var(--admin-text-secondary);
    }
    .variants-inline-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .variants-inline-table th, .variants-inline-table td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      text-align: left;
    }
    .variants-inline-table th {
      font-weight: 700;
      color: var(--admin-text-secondary);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.04em;
      background: rgba(0, 0, 0, 0.02);
    }
    .variants-inline-table tbody tr:hover {
      background: rgba(0, 0, 0, 0.02) !important;
    }
    .variant-thumb {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--admin-border-color);
    }
    .no-img-text {
      color: var(--admin-text-secondary);
    }
    .sku-code {
      font-family: monospace;
      background: rgba(0,0,0,0.04);
      padding: 2px 4px;
      border-radius: 4px;
    }
    .empty-inline-row {
      text-align: center;
      color: var(--admin-text-secondary);
      padding: 16px !important;
    }
    .stock-badge {
      display: inline-block;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 700;
      border-radius: var(--radius-md);
      background: var(--admin-bg-base);
      border: 1px solid var(--admin-border-color);
      color: var(--admin-text-primary);
      text-align: center;
      min-width: 48px;
    }
  `]
})
export class InventarioComponent implements OnInit {
  activeTab: 'productos' | 'categorias' = 'productos';
  loading: boolean = true;

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  productos: Producto[] = [];
  variantes: VarianteProducto[] = [];

  expandedProducts: { [id: number]: boolean } = {};
  productVariantsMap: { [productId: number]: VarianteProducto[] } = {};
  loadingVariants: { [productId: number]: boolean } = {};

  expandedCategories: { [id: number]: boolean } = {};
  categorySubcategoriasMap: { [categoriaId: number]: Subcategoria[] } = {};

  // Modals visibility
  showCategoryModal = false;
  showSubcategoryModal = false;
  showProductModal = false;
  showVariantsModal = false;

  // Forms
  categoryForm = { id: undefined as any, nombre: '', descripcion: '', estado: true };
  subcategoryForm = { id: undefined as any, categoriaId: 0, nombre: '', descripcion: '', estado: true };
  productForm = { id: undefined as any, categoriaId: 0, subcategoriaId: null as number | null, nombre: '', descripcion: '', precioBase: 0, imagenGeneralUrl: '' };
  variantForm = { talla: '', color: '', stock: 0, sku: '', imagenUrl: '', precio: null as number | null };

  editingCategory: Categoria | null = null;
  editingSubcategory: Subcategoria | null = null;
  selectedCategoryForSubcategory: Categoria | null = null;
  editingProduct: Producto | null = null;
  selectedProductForVariants: Producto | null = null;
  editingVariant: VarianteProducto | null = null;

  constructor(private productoService: ProductoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: 'productos' | 'categorias'): void {
    this.activeTab = tab;
  }

  loadData(): void {
    this.loading = true;
    this.productoService.getAllCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats;
        
        this.productoService.getAllSubcategorias().subscribe({
          next: (subs) => {
            this.subcategorias = subs;
            
            // Build the map of category subcategories for faster lookup
            this.categorySubcategoriasMap = {};
            this.subcategorias.forEach(s => {
              if (!this.categorySubcategoriasMap[s.categoriaId]) {
                this.categorySubcategoriasMap[s.categoriaId] = [];
              }
              this.categorySubcategoriasMap[s.categoriaId].push(s);
            });

            this.productoService.getProductos().subscribe({
              next: (prods) => {
                this.productos = prods;
                this.loading = false;
                this.cdr.markForCheck();
              },
              error: (err) => {
                console.error('Error al cargar productos', err);
                this.loading = false;
                this.cdr.markForCheck();
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar subcategorías', err);
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getCategoryName(catId: number): string {
    const cat = this.categorias.find(c => c.id === catId);
    return cat ? cat.nombre : 'Sin categoría';
  }

  // Category Modal
  openCategoryModal(cat?: Categoria): void {
    if (cat) {
      this.editingCategory = cat;
      this.categoryForm = {
        id: cat.id,
        nombre: cat.nombre,
        descripcion: cat.descripcion || '',
        estado: cat.estado
      };
    } else {
      this.editingCategory = null;
      this.categoryForm = { id: undefined, nombre: '', descripcion: '', estado: true };
    }
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  saveCategory(): void {
    const operation = this.editingCategory?.id
      ? this.productoService.updateCategoria(this.categoryForm)
      : this.productoService.createCategoria(this.categoryForm);

    operation.subscribe({
      next: () => {
        this.closeCategoryModal();
        this.loadData();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al guardar categoría', err)
    });
  }

  deleteCategoria(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.productoService.deleteCategoria(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error al eliminar categoría', err)
      });
    }
  }

  // Product Modal
  openProductModal(prod?: Producto): void {
    if (prod) {
      this.editingProduct = prod;
      this.productForm = {
        id: prod.id,
        categoriaId: prod.categoriaId,
        subcategoriaId: prod.subcategoriaId || null,
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        precioBase: prod.precioBase,
        imagenGeneralUrl: prod.imagenGeneralUrl || ''
      };
    } else {
      this.editingProduct = null;
      this.productForm = { id: undefined, categoriaId: this.categorias[0]?.id || 0, subcategoriaId: null, nombre: '', descripcion: '', precioBase: 0, imagenGeneralUrl: '' };
    }
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
  }

  saveProduct(): void {
    const operation = this.editingProduct?.id
      ? this.productoService.updateProducto(this.productForm)
      : this.productoService.createProducto(this.productForm);

    operation.subscribe({
      next: () => {
        this.closeProductModal();
        this.loadData();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al guardar producto', err)
    });
  }

  deleteProducto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.deleteProducto(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error al eliminar producto', err)
      });
    }
  }

  // Variants Modal
  openVariantsModal(prod: Producto): void {
    this.selectedProductForVariants = prod;
    this.variantForm = { talla: '', color: '', stock: 0, sku: '', imagenUrl: '', precio: null };
    this.editingVariant = null;
    this.loadVariantsForSelectedProduct();
    this.showVariantsModal = true;
  }

  loadVariantsForSelectedProduct(): void {
    if (!this.selectedProductForVariants?.id) return;
    this.productoService.getVariantesByProductoId(this.selectedProductForVariants.id).subscribe({
      next: (vars) => {
        this.variantes = vars;
        this.productVariantsMap[this.selectedProductForVariants!.id!] = vars;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar variantes', err)
    });
  }

  toggleProductExpand(p: Producto): void {
    const id = p.id!;
    this.expandedProducts[id] = !this.expandedProducts[id];
    if (this.expandedProducts[id] && !this.productVariantsMap[id]) {
      this.loadVariantsForProduct(id);
    }
    this.cdr.markForCheck();
  }

  loadVariantsForProduct(productId: number): void {
    this.loadingVariants[productId] = true;
    this.productoService.getVariantesByProductoId(productId).subscribe({
      next: (vars) => {
        this.productVariantsMap[productId] = vars;
        this.loadingVariants[productId] = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar variantes', err);
        this.loadingVariants[productId] = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateVariantStockInline(variant: VarianteProducto, productId: number): void {
    this.productoService.updateVariante(variant).subscribe({
      next: () => {
        console.log('Stock actualizado para ' + variant.sku);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al actualizar variante', err)
    });
  }

  closeVariantsModal(): void {
    this.showVariantsModal = false;
    this.editingVariant = null;
    this.variantForm = { talla: '', color: '', stock: 0, sku: '', imagenUrl: '', precio: null };
  }

  editVariant(v: VarianteProducto): void {
    this.editingVariant = v;
    this.variantForm = {
      talla: v.talla,
      color: v.color,
      stock: v.stock,
      sku: v.sku,
      imagenUrl: v.imagenUrl || '',
      precio: v.precio || null
    };
    this.cdr.markForCheck();
  }

  cancelEditVariant(): void {
    this.editingVariant = null;
    this.variantForm = { talla: '', color: '', stock: 0, sku: '', imagenUrl: '', precio: null };
    this.cdr.markForCheck();
  }

  saveVariant(): void {
    if (!this.selectedProductForVariants?.id) return;

    if (this.editingVariant) {
      const updatedVariant: VarianteProducto = {
        ...this.editingVariant,
        talla: this.variantForm.talla,
        color: this.variantForm.color,
        stock: this.variantForm.stock,
        sku: this.variantForm.sku,
        imagenUrl: this.variantForm.imagenUrl || undefined,
        precio: this.variantForm.precio || undefined
      };

      this.productoService.updateVariante(updatedVariant).subscribe({
        next: () => {
          this.cancelEditVariant();
          this.loadVariantsForSelectedProduct();
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error al actualizar variante', err)
      });
    } else {
      const newVariant: VarianteProducto = {
        productoId: this.selectedProductForVariants.id,
        talla: this.variantForm.talla,
        color: this.variantForm.color,
        stock: this.variantForm.stock,
        sku: this.variantForm.sku,
        imagenUrl: this.variantForm.imagenUrl || undefined,
        precio: this.variantForm.precio || undefined
      };

      this.productoService.createVariante(newVariant).subscribe({
        next: () => {
          this.variantForm = { talla: '', color: '', stock: 0, sku: '', imagenUrl: '', precio: null };
          this.loadVariantsForSelectedProduct();
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error al agregar variante', err)
      });
    }
  }

  updateVariantStock(variant: VarianteProducto): void {
    this.productoService.updateVariante(variant).subscribe({
      next: () => {
        console.log('Stock actualizado para ' + variant.sku);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al actualizar variante', err)
    });
  }

  deleteVariant(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta variante?')) {
      this.productoService.deleteVariante(id).subscribe({
        next: () => this.loadVariantsForSelectedProduct(),
        error: (err) => console.error('Error al eliminar variante', err)
      });
    }
  }

  getSubcategoryName(subId: number): string {
    const sub = this.subcategorias.find(s => s.id === subId);
    return sub ? sub.nombre : 'Sin subcategoría';
  }

  onCategoryChange(): void {
    this.productForm.subcategoriaId = null;
    this.cdr.markForCheck();
  }

  getSubcategoriasForSelectedCategory(catId: number): Subcategoria[] {
    return this.subcategorias.filter(s => s.categoriaId == catId && s.estado);
  }

  toggleCategoryExpand(c: Categoria): void {
    const id = c.id!;
    this.expandedCategories[id] = !this.expandedCategories[id];
    this.cdr.markForCheck();
  }

  // Subcategory Modal
  openSubcategoryModal(cat: Categoria, sub?: Subcategoria): void {
    this.selectedCategoryForSubcategory = cat;
    if (sub) {
      this.editingSubcategory = sub;
      this.subcategoryForm = {
        id: sub.id,
        categoriaId: sub.categoriaId,
        nombre: sub.nombre,
        descripcion: sub.descripcion || '',
        estado: sub.estado
      };
    } else {
      this.editingSubcategory = null;
      this.subcategoryForm = {
        id: undefined,
        categoriaId: cat.id!,
        nombre: '',
        descripcion: '',
        estado: true
      };
    }
    this.showSubcategoryModal = true;
  }

  closeSubcategoryModal(): void {
    this.showSubcategoryModal = false;
  }

  saveSubcategory(): void {
    const operation = this.editingSubcategory?.id
      ? this.productoService.updateSubcategoria(this.subcategoryForm)
      : this.productoService.createSubcategoria(this.subcategoryForm);

    operation.subscribe({
      next: () => {
        this.closeSubcategoryModal();
        this.loadData();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al guardar subcategoría', err)
    });
  }

  deleteSubcategory(id: number, catId: number): void {
    if (confirm('¿Estás seguro de eliminar esta subcategoría?')) {
      this.productoService.deleteSubcategoria(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error al eliminar subcategoría', err)
      });
    }
  }
}
