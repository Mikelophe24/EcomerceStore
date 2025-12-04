import { Component, inject } from '@angular/core';
import { ViewPanelDirective } from '../../../directives/view-panel.directive';
import { EcommerceStore } from '../../../ecommerce';

@Component({
  selector: 'app-list-cart-items',
  standalone: true,
  imports: [ViewPanelDirective],
  template: `
    <div appViewPanel>
      <h2 class="text-2xk font-bold mb-4"> Cart Items ({{store.cartCount()}})</h2>
      <div class="flex flex-col gap-6">
        @for(item of store.cartItems(); track item.product.id){
          
        }
      </div>
    </div>
  `,
  styles: ``
})
export class ListCartItemsComponent {
  store = inject(EcommerceStore);
}
