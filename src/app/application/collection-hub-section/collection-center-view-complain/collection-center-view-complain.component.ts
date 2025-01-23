import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-collection-center-view-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule],
  templateUrl: './collection-center-view-complain.component.html',
  styleUrl: './collection-center-view-complain.component.css',
})
export class CollectionCenterViewComplainComponent {}
