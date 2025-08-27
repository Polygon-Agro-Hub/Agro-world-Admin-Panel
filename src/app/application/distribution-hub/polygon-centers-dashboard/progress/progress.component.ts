import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit {
  isLoading = false;
  hasData: boolean = false;

  ngOnInit(): void {}
}
