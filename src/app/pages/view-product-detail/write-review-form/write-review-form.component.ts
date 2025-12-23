import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EcommerceStore } from '../../../ecommerce';
import { Product } from '../../../models/products';
import { ToasterService } from '../../../servives/toaster.service';

@Component({
  selector: 'app-write-review-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h3 class="text-lg font-semibold mb-4">Write a Review</h3>

      <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="w-full mb-4">
          <mat-label>Rating*</mat-label>
          <mat-select formControlName="rating">
            <mat-option [value]="5">5 Stars - Excellent</mat-option>
            <mat-option [value]="4">4 Stars - Very Good</mat-option>
            <mat-option [value]="3">3 Stars - Good</mat-option>
            <mat-option [value]="2">2 Stars - Fair</mat-option>
            <mat-option [value]="1">1 Star - Poor</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mb-4">
          <mat-label>Review Title*</mat-label>
          <input matInput formControlName="title" placeholder="Summarize your review" />
          @if (reviewForm.get('title')?.hasError('required') && reviewForm.get('title')?.touched) {
          <mat-error>Review title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mb-4">
          <mat-label>Review**</mat-label>
          <textarea
            matInput
            formControlName="comment"
            rows="6"
            placeholder="Share your experience with this product"
            class="resize-y"
          ></textarea>
          @if (reviewForm.get('comment')?.hasError('required') &&
          reviewForm.get('comment')?.touched) {
          <mat-error>Review text is required</mat-error>
          }
        </mat-form-field>

        <div class="flex gap-3 justify-end">
          <button type="button" mat-button (click)="onCancelClick()" class="!text-blue-600">
            Cancel
          </button>
          <button
            type="submit"
            mat-button
            [disabled]="reviewForm.invalid"
            [class.opacity-50]="reviewForm.invalid"
            [class.cursor-not-allowed]="reviewForm.invalid"
            class="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-4 py-2"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class WriteReviewFormComponent {
  product = input.required<Product>();
  onCancel = output<void>();
  store = inject(EcommerceStore);
  toaster = inject(ToasterService);

  reviewForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    rating: new FormControl(5, [Validators.required]),
    comment: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const user = this.store.user();
    if (!user) {
      this.toaster.error('Please sign in to write a review');
      return;
    }

    // ❌ DISABLED: Submit review functionality
    this.toaster.error('Review submission is currently disabled');

    // const formValue = this.reviewForm.value;
    // this.store.submitReview({
    //   productId: this.product().id,
    //   title: formValue.title!,
    //   rating: formValue.rating!,
    //   comment: formValue.comment!,
    // });

    // this.reviewForm.reset({
    //   title: '',
    //   rating: 5,
    //   comment: '',
    // });
    // this.reviewForm.markAsUntouched();

    // // Delay emit to avoid router transition conflicts
    // setTimeout(() => {
    //   this.onCancel.emit();
    //   this.toaster.success('Review submitted successfully');
    // }, 0);
  }

  onCancelClick() {
    this.reviewForm.reset({
      title: '',
      rating: 5,
      comment: '',
    });
    this.reviewForm.markAsUntouched();
    this.onCancel.emit();
  }
}
