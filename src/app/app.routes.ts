import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products/all',
  },
  {
    path: 'products/:category', 
    // ở đây áp dụng route param
    loadComponent: () => import('./pages/products-grid/products-grid'),
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/my-wishlist/my-wishlist'),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products-grid/products-grid'),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/view-cart/view-cart.component'),
  },
];
