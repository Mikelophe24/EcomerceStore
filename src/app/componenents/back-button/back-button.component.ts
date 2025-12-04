import { Component, input } from '@angular/core';
import { MatButton, MatAnchor } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatAnchor, RouterLink, MatIcon],
  template: `
    <button matButton="text" [routerLink]="navigateTo() ?? null" class="flex items-center gap-1"> 
      <mat-icon>
        arrow_back
      </mat-icon>
      <ng-content/>
    </button>
  `,
  styles: `
  :host{
    display: block;
  }
  `
  
})  
export class BackButtonComponent {
    navigateTo= input<string>();
}
