import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-officer-target',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
  ],
  templateUrl: './officer-target.component.html',
  styleUrl: './officer-target.component.css',
})
export class OfficerTargetComponent {
  isLoading = false;
  hasData: boolean = false;

  ngOnInit(): void {}
}
