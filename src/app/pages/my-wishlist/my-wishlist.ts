import { Component, inject } from '@angular/core';
import { BackButtonComponent } from "../../componenents/back-button/back-button.component";
import { EcommerceStore } from '../../ecommerce';
import { ProductCartComponent } from "../../components/product-cart/product-cart.component";
import { MatIcon } from "@angular/material/icon";
import { EmptyWishlistComponent } from "./empty-wishlist/empty-wishlist.component";

@Component({
  selector: 'app-my-wishlist',
  imports: [BackButtonComponent, ProductCartComponent, MatIcon, EmptyWishlistComponent],
  template: ` <div class="mx-auto max-w-[1200px] py-6 px-4">
  <app-back-button class="mb-6"  navigateTo="/products/all">Continue Shopping</app-back-button>

  @if(store.wishlistCount() > 0 ){
    <div class="flex justify-between items-center mb-6">
      <h1 class= "text-2xl font-bold">My wishlist</h1>
      <span class="text-gray-500 text-xl"> {{store.wishlistCount()}} items</span>
    </div>

    <div class="responsive-grid">
      @for(product of store.wishlistItems(); track product.id){
        <app-product-cart [product]="product">
           <button class="!absolute z-10 top-3 right-3 w- h-10 rounded-full !bg-white border-0 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-100 hover:shadow-lg"
            matIconButton 
            (click)="store.removeFromWishlist(product)">
            <mat-icon>delete</mat-icon>
          </button>
        </app-product-cart>
      }
    </div>
  }@else{
    <app-empty-wishlist/>
  }
  

</div> 
`,

  styles: ``,
})
export default class MyWishlist {

  store = inject(EcommerceStore);
}
