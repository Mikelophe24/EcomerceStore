import { Component, computed, inject, input, output } from '@angular/core';
import { Product } from '../../models/products';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EcommerceStore } from '../../ecommerce';
import { RouterLink } from '@angular/router';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-product-cart',
  standalone: true,
  imports: [MatAnchor, MatIcon, RouterLink, StarRatingComponent],
  template: `
    <div
      class="relative bg-white cursor-pointer rounded-xl shadow-lg ovchecerflow-hidden flex flex-col h-full  transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
    >
      <img
        [src]="product().imageUrl"
        class="w-full h-[300px] object-cover rounded-t-xl "
        [routerLink]="['/product', product().id]"
        [style.view-transition-name]="'product-image-' + product().id"
      />

      <ng-content></ng-content>

      <div class="p-5 flex flex-col flex-1" [routerLink]="['/product', product().id]">
        <h3 class="" text-lg font-semibold text-gray-900 mb-2 leading-tight>
          {{ product().name }}
        </h3>

        <p class="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">{{ product().description }}</p>

        <!-- add rating component -->
        <app-star-rating [rating]="averageRating()" class="mb-3">
          {{ totalReviews() }}
        </app-star-rating>

        <div class="text-sm font-medium mb-4">
          {{ product().inStock ? 'In Stock' : 'Out of stock' }}
        </div>

        <div class="flex items-center justify-between mt-auto">
          <span class="text-2xl font-bold text-gray-900"> \${{ product().price }} </span>
          <button
            matButton="filled"
            class="flex items-center gap-2"
            (click)="$event.stopPropagation(); store.addToCart(product(), 1)"
          >
            <mat-icon> shopping_cart </mat-icon>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ProductCartComponent {
  product = input.required<Product>();
  store = inject(EcommerceStore);

  totalReviews = computed(() => this.product().reviews.length);

  averageRating = computed(() => {
    const reviews = this.product().reviews;
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  });
}
