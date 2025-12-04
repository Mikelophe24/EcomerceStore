import { Component, computed, inject, input, output } from '@angular/core';
import { Product } from '../../models/products';
import { MatAnchor } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-product-cart',
  standalone: true,
  imports: [MatAnchor, MatIcon],
  template: `
      <div
        class="relative bg-white cursor-pointer rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
      >
        <img [src]="product().imageUrl" class="w-full h-[300px] object-cover rounded-t-xl" />

        <!-- <button class="!absolute z-10 top-3 right-3 w- h-10 rounded-full !bg-white border-0 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-100 hover:shadow-lg"
        [class]="isInWishlist() ? '!text-red-500': '!text-gray-400'"
        matIconButton (click)="toggleWishlist(product())">
        <mat-icon>
          {{isInWishlist() ? 'favorite' : 'favorite_border'}}
        </mat-icon>
      </button> -->
      <ng-content></ng-content>


        <div class="p-5 flex flex-col flex-1">
          <h3 class=""text-lg font-semibold text-gray-900 mb-2 leading-tight >
            {{product().name}}
          </h3>

          <p class="text-sm text-gray-600 mb-4 flex-1 leading-relaxed"> {{product().description}}</p>
          
          <!-- add rating component -->

          <div class="text-sm font-medium mb-4">
              {{product().inStock? 'In Stock' : 'Out of stock'}}
          </div>

          <div class="flex items-center justify-between mt-auto">
            <span class="text-2xl font-bold text-gray-900">
              \${{product().price}}
            </span>
            <button matButton="filled" class="flex items-center gap-2" (click)="addToCartClicked.emit(product())">
              <mat-icon>
                shopping_cart
              </mat-icon>
              Add to cart
            </button>
          </div>
        </div>



      </div>
  `,
  styles: ``
})
export class ProductCartComponent {

    product = input.required<Product>();


    addToCartClicked = output<Product>();

    

}
