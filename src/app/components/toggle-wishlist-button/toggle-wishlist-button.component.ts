import { Component, computed, inject, input } from '@angular/core';
import { EcommerceStore } from '../../ecommerce';
import { Product } from '../../models/products';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-toggle-wishlist-button',
  standalone: true,
  imports: [MatIconButton, MatIcon],
  template: `
      <button class=" w- h-10 rounded-full !bg-white border-0 shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-100 hover:shadow-lg"
            [class]="isInWishlist() ? '!text-red-500': '!text-gray-400'"
            matIconButton (click)="toggleWishlist(product())">
            <mat-icon>
              {{isInWishlist() ? 'favorite' : 'favorite_border'}}
            </mat-icon>
          </button>
  `,
  styles: ``
})
export class ToggleWishlistButtonComponent {

    product = input.required<Product>();
    isInWishlist  = computed(() => this.store.wishlistItems().find(p => p.id=== this.product().id))

    store = inject(EcommerceStore);

    
    toggleWishlist(product :Product){
      if(this.isInWishlist()){
          this.store.removeFromWishlist(product);
      }
      else{
        this.store.addToWishlish(product);
      }
    }

  }
