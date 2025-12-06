import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HeaderActions } from '../header-actions/header-actions';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { inject } from '@angular/core';
import { EcommerceStore } from '../../ecommerce';

@Component({
  selector: 'app-header',
  imports: [MatToolbar, MatIconButton, MatIcon, HeaderActions, SearchBarComponent],
  template: `
    <mat-toolbar class="w-full elevated py-2 z-10 relative bg-gray-50">
      <div class="max-w-[1200px] mx-auto w-full flex items-center justify-between gap-4">
        <!-- Left: Menu + Store Name -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button matIconButton class="text-gray-700" (click)="store.toggleSidebar()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="text-gray-800 font-medium">Modern Store</span>
        </div>

        <!-- Center: Search Bar -->
        <div class="flex-1 max-w-[650px] mx-4">
          <app-search-bar />
        </div>

        <!-- Right: Header Actions -->
        <div class="flex-shrink-0">
          <app-header-actions />
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: ``,
})
export class Header {
  store = inject(EcommerceStore);
}
