import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { CatalogoComponent } from './features/cliente/catalogo/catalogo.component';
import { DetalleProductoComponent } from './features/cliente/detalle-producto/detalle-producto.component';
import { CheckoutComponent } from './features/cliente/checkout/checkout.component';
import { LoginComponent } from './features/admin/login/login.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { InventarioComponent } from './features/admin/inventario/inventario.component';
import { VentasAdminComponent } from './features/admin/ventas-admin/ventas-admin.component';

export const routes: Routes = [
  // Client (Public)
  { path: '', component: CatalogoComponent },
  { path: 'producto/:id', component: DetalleProductoComponent },
  { path: 'checkout', component: CheckoutComponent },

  // Admin (Private & Login)
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/inventario', component: InventarioComponent, canActivate: [adminGuard] },
  { path: 'admin/ventas', component: VentasAdminComponent, canActivate: [adminGuard] },

  // Fallback
  { path: '**', redirectTo: '' }
];
