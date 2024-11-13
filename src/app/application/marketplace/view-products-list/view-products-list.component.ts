import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-products-list',
  standalone: true,
  imports: [CommonModule,DropdownModule],
  templateUrl: './view-products-list.component.html',
  styleUrl: './view-products-list.component.css'
})
export class ViewProductsListComponent {

}
