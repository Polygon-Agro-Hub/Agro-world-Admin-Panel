import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-out-of-delivery',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './out-of-delivery.component.html',
  styleUrl: './out-of-delivery.component.css',
})
export class OutOfDeliveryComponent implements OnInit {
  isLoading = false;
  hasData: boolean = false;

  ngOnInit(): void {}
}
