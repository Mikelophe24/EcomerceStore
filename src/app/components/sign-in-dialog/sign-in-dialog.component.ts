import { Component, inject, signal } from '@angular/core';
import { MatIconButton, MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // nếu dùng <input matInput>
import { EcommerceStore } from '../../ecommerce';
import { SignInParams } from '../../models/user';
import { SignUpDialogComponent } from '../sign-up-dialog/sign-up-dialog.component';
@Component({
  selector: 'app-sign-in-dialog',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatSuffix,
    MatPrefix,
    MatAnchor,
    ReactiveFormsModule,
  ],
  template: `
    <div class="p-8 max-w-[400px] flex flex-col">
      <div class="flex justify-between">
        <div>
          <h2 class="text-xl font-medium mb-1">Sign In</h2>
          <p class="text-sm text-gray-500">Sign in to your account to continue shopping</p>
        </div>
        <button tabindex="-1" matIconButton class="-mt-2 -mr-2" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <form class="mt-6" [formGroup]="signinForm" (ngSubmit)="signIn()">
        <mat-form-field class="w-full mb-4">
          <input type="email" matInput formControlName="email" placeholder="Enter your email" />
          <mat-icon matPrefix>email</mat-icon>
        </mat-form-field>
        <mat-form-field class="w-full mb-6">
          <input
            matInput
            formControlName="password"
            [type]="passwordVisible() ? 'text' : 'password'"
            placeholder="Enter your password"
          />
          <mat-icon matPrefix></mat-icon>
          <button
            matSuffix
            matIconButton
            type="button"
            class="mr-2"
            (click)="passwordVisible.set(!passwordVisible())"
          >
            <mat-icon [fontIcon]="passwordVisible() ? 'visiblility_off' : 'visibility'"></mat-icon>
          </button>
        </mat-form-field>

        <button type="submit" matButton="filled" class="w-full">Sign in</button>
      </form>

      <p class="text-sm text-gray-500 mt-2 text-center">
        Don't have an account
        <a class="text-blue-500 cursor-pointer " (click)="openSignUpDialog()">Sign up</a>
      </p>
    </div>
  `,
  styles: ``,
})
export class SignInDialogComponent {
  store = inject(EcommerceStore);
  fb = inject(NonNullableFormBuilder);

  data = inject<{ checkout: boolean }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);

  matDialog = inject(MatDialog);

  passwordVisible = signal(false);

  signinForm = this.fb.group({
    email: ['minh@gmail.com', Validators.required],
    password: ['123456', Validators.required],
  });
  signIn() {
    if (!this.signinForm.valid) {
      this.signinForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.signinForm.value;

    this.store.signIn({
      email,
      password,
      checkout: this.data?.checkout,
      dialogId: this.dialogRef.id,
    } as SignInParams);
  }

  openSignUpDialog() {
    this.dialogRef.close();
    this.matDialog.open(SignUpDialogComponent, {
      disableClose: true,
      data: {
        checkout: this.data?.checkout,
      },
    });
  }
}
