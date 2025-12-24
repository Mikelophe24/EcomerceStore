import { Component, computed, inject } from '@angular/core';
import { ViewPanelDirective } from '../../directives/view-panel.directive';
import { EcommerceStore } from '../../ecommerce';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-summarize-order',
  imports: [ViewPanelDirective, MatButtonModule],
  template: `
    <div appViewPanel>
      <h2 class="text-2xl font-bold mb-4">Order Summary</h2>

      <div class="space-y-2  pb-4">
        <ng-content select="[checkoutItems]"></ng-content>
      </div>
      <div class="space-y-3 text-lg pt-4 border-t">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>\${{ subtotal() }}</span>
        </div>
        <div class="flex justify-between">
          <span>Tax</span>
          <span>\${{ tax() }}</span>
        </div>
        <div class="flex justify-between border-t font-bold pt-3 text-lg">
          <span>Total</span>
          <span>\${{ total() }}</span>
        </div>
      </div>
      <ng-content select="[actionButtons]"></ng-content>
    </div>
  `,
  styles: ``,
})
export class SummarizeOrder {
  store = inject(EcommerceStore);
  subtotal = computed(() =>
    Math.round(
      this.store.cartItems().reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    )
  );

  tax = computed(() => Math.round(0.05 * this.subtotal()));
  total = computed(() => Math.round(this.subtotal() + this.tax())); 
}
