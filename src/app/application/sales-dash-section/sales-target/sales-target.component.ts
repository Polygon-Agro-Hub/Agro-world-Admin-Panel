import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-sales-target',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule],
  templateUrl: './sales-target.component.html',
  styleUrl: './sales-target.component.css',
})
export class SalesTargetComponent {}
