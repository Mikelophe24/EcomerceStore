import { Component, inject, input, signal } from '@angular/core';
import { Product } from '../../../models/products';
import { RatingSummaryComponent } from '../rating-summary/rating-summary.component';
import { WriteReviewFormComponent } from '../write-review-form/write-review-form.component';
import { MatButtonModule } from '@angular/material/button';
import { StarRatingComponent } from '../../../components/star-rating/star-rating.component';
import { DatePipe } from '@angular/common';
import { EcommerceStore } from '../../../ecommerce';
import { MatDialog } from '@angular/material/dialog';
import { SignInDialogComponent } from '../../../components/sign-in-dialog/sign-in-dialog.component';

@Component({
  selector: 'app-view-reviews',
  standalone: true,
  imports: [
    RatingSummaryComponent,
    // WriteReviewFormComponent, // ❌ DISABLED
    MatButtonModule,
    StarRatingComponent,
    DatePipe,
  ],
  template: `
    <div class="appViewPanel">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Customer Reviews</h2>
        <!-- ❌ DISABLED: Write review button removed -->
        <!-- <button 
          mat-raised-button 
          color="primary"
          (click)="handleWriteReviewClick()"
        >
          Write a Review
        </button> -->
      </div>

      <!-- ❌ DISABLED: Write review form removed -->
      <!-- @if (showForm()) {
        <app-write-review-form 
          [product]="product()" 
          (onCancel)="showForm.set(false)"
        />
      } -->

      <app-rating-summary [product]="product()" />

      <div class="mt-8">
        <h3 class="text-lg font-semibold mb-4">All Reviews</h3>
        <div class="flex flex-col gap-6">
          @for (review of product().reviews; track review.id) {
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div class="flex items-start gap-4">
              <img
                [src]="review.userImageUrl"
                [alt]="review.userName"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ review.userName }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <app-star-rating [rating]="review.rating" />
                      <span class="text-sm text-gray-500">
                        {{ review.reviewDate | date : 'mediumDate' }}
                      </span>
                    </div>
                  </div>
                </div>
                <h5 class="font-medium text-gray-900 mb-2">{{ review.title }}</h5>
                <p class="text-gray-700">{{ review.comment }}</p>
              </div>
            </div>
          </div>
          } @empty {
          <div class="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ViewReviewsComponent {
  product = input.required<Product>();
  showForm = signal(false);
  store = inject(EcommerceStore);
  matDialog = inject(MatDialog);

  handleWriteReviewClick() {
    const user = this.store.user();
    if (!user) {
      // Open sign in dialog if user is not logged in
      const dialogRef = this.matDialog.open(SignInDialogComponent, {
        disableClose: true,
        data: {
          checkout: false,
        },
      });

      // After dialog closes, check if user is now logged in and show form
      dialogRef.afterClosed().subscribe(() => {
        const currentUser = this.store.user();
        if (currentUser) {
          this.showForm.set(true);
        }
      });
      return;
    }
    // Show form if user is logged in
    this.showForm.set(!this.showForm());
  }
}
