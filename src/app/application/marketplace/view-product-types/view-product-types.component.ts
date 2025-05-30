import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-product-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-product-types.component.html',
  styleUrl: './view-product-types.component.css',
})
export class ViewProductTypesComponent {
  constructor(private router: Router) {}

  navigateToBack(): void {
    this.router.navigate(['/market/action']);
  }
}
