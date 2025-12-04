import { Component, input } from '@angular/core';
import { CartItem } from '../../models/cart';

@Component({
  selector: 'app-show-cart-items',
  standalone: true,
  imports: [],
  template: `
    <div class="grid grid-cols-3 grids-col-[3fr-1fr-1fr]">
      <div class="flex items-center gap-4">
      <img [src]="item().product.imageUrl" class="w-24 h-24 rounded-lg object-cover">

    </div>
</div>
  `,
  styles: ``
})
export class ShowCartItemsComponent {
  item = input.required<CartItem>();
}
