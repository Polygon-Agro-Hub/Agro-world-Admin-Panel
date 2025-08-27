import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-officers',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './officers.component.html',
  styleUrl: './officers.component.css',
})
export class OfficersComponent implements OnInit {
  isLoading = false;
  hasData: boolean = false;

  ngOnInit(): void {}
}
