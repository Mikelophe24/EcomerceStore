import { Component, inject } from '@angular/core';
import { BackButtonComponent } from '../../componenents/back-button/back-button.component';
import { ListCartItemsComponent } from './list-cart-items/list-cart-items.component';
import { TeaseWishlist } from './tease-wishlist/tease-wishlist';
import { SummarizeOrder } from '../../components/summarize-order/summarize-order';
import { MatAnchor } from '@angular/material/button';
import { EcommerceStore } from '../../ecommerce';

@Component({
  selector: 'app-view-cart',
  standalone: true,
  imports: [BackButtonComponent, ListCartItemsComponent, TeaseWishlist, SummarizeOrder],
  template: `
    <div class="mx-auto max-w-[1200px] py-6">
      <app-back-button class="mb-6" navigateTo="/products/all">Continue Shopping </app-back-button>
      <h1 class="text-3xl font-extrabold mb-4">Shopping Cart</h1>

      <app-tease-wishlist class="mb-6 block" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <app-list-cart-items />
        </div>
        <div>
          <app-summarize-order>
            <!-- ❌ DISABLED: Checkout button removed -->
            <!-- <ng-container actionButtons >
                  <button matButton="filled" class="w-full mt-6 py-3" (click)="store.proceedToCheckout()">Proceed to Checkout</button>
                </ng-container> -->
          </app-summarize-order>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export default class ViewCartComponent {
  store = inject(EcommerceStore);
}
