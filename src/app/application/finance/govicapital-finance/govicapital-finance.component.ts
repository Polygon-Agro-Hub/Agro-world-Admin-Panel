import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-govicapital-finance',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './govicapital-finance.component.html',
  styleUrl: './govicapital-finance.component.css',
})
export class GovicapitalFinanceComponent {
  isLoading = false;
  total: number | null = null;

  constructor(private location: Location) {}

  back(): void {
    this.location.back();
  }
}
