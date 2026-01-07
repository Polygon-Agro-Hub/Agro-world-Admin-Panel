import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-all-pikup-oders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    CalendarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './all-pikup-oders.component.html',
  styleUrl: './all-pikup-oders.component.css',
})
export class AllPikupOdersComponent {
  isLoading = false;
}
