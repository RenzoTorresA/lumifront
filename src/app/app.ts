import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CarritoComponent } from './features/cliente/carrito/carrito.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CarritoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  isAdminRoute = false;
  cartOpen = false;
  showScrollBtn = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.includes('/admin');
      this.cdr.markForCheck();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Muestra el botón si el scroll vertical supera los 300px
    const scrollTop = globalThis.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollBtn = scrollTop > 300;
    this.cdr.markForCheck();
  }

  scrollToTop() {
    globalThis.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

