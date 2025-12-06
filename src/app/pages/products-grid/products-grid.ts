import { Component, computed, inject, input, signal } from '@angular/core';
import { ProductCartComponent } from '../../components/product-cart/product-cart.component';
import { MatSidenavContainer, MatSidenavContent, MatSidenav } from '@angular/material/sidenav';

import { MatNavList, MatListItem, MatListItemTitle } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { EcommerceStore } from '../../ecommerce';
import { ToggleWishlistButtonComponent } from '../../components/toggle-wishlist-button/toggle-wishlist-button.component';
@Component({
  selector: 'app-products-grid',
  imports: [
    ProductCartComponent,
    TitleCasePipe,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatListItemTitle,
    RouterLink,
    ToggleWishlistButtonComponent,
  ],
  template: `
    <mat-sidenav-container class="h-full">
      <mat-sidenav mode="side" [opened]="store.isSidebarOpen()">
        <div class="p-6">
          <h2 class="text-lg text-gray-900">Categories</h2>
          <mat-nav-list>
            @for(cat of categories(); track cat){
            <mat-list-item
              [activated]="cat === category()"
              class="my-2"
              [routerLink]="['/products', cat]"
            >
              <span
                matListItemTitle
                class="font-medium"
                [class]="cat === category() ? '!text-white' : null"
                >{{ cat | titlecase }}
              </span>
            </mat-list-item>
            }
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="bg-gray-100 p-6 h-full">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ category() | titlecase }}</h1>
        <p class="text-base text-gray-600 mb-6">
          {{ store.filteredProducts().length }}
          {{ store.filteredProducts().length <= 1 ? 'product' : 'products' }} found
        </p>
        <div class="responsive-grid">
          @for (product of store.filteredProducts(); track product.id ) {
          <div [style.view-transition-name]="'product-item-' + product.id">
            <app-product-cart [product]="product">
              <app-toggle-wishlist-button
                [style.view-transition-name]="'wishlist-button-' + product.id"
                class="!absolute z-10 top-3 right-3 !bg-white shadow-md rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg"
                [product]="product"
              />
            </app-product-cart>
          </div>
          }
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: ``,
})
export default class ProductsGrid {
  category = input<string>('all');

  store = inject(EcommerceStore);

  categories = signal<string[]>([
    'all',
    'electronics',
    'photography',
    'furniture',
    'fashion',
    'kitchen',
    'home',
    'accessories',
    'lifestyle',
  ]);

  constructor() {
    this.store.setCategory(this.category);
  }
}
