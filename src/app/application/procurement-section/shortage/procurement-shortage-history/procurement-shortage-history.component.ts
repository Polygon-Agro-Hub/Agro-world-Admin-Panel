import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface ShortageItem {
  id: number;
  itemName: string;
  imageUrl: string;
  shortageQty: number;
  unit: string;
  marketPricePerKg: number;
  isAssigned: boolean;
  assignedCentre?: string;
  ceilingPercentage?: number;
  firstAssignedBy?: string;
  finalizedBy?: string;
  createdAt: string;
}

@Component({
  selector: 'app-procurement-shortage-history',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './procurement-shortage-history.component.html',
  styleUrl: './procurement-shortage-history.component.css',
})
export class ProcurementShortageHistoryComponent implements OnInit {
  isLoading = false;
  hasData: boolean = true;

  shortageItems: ShortageItem[] = [];
  notAssignedItems: ShortageItem[] = [];
  assignedItems: ShortageItem[] = [];

  selectedDate: Date | null = new Date();

  // Fallback images for known items — update the paths to match your assets folder
  private readonly itemImageMap: { [key: string]: string } = {
    garlic: 'assets/items/garlic.png',
    turmeric: 'assets/items/turmeric.png',
    watermelon: 'assets/items/watermelon.png',
    'yellow lemon premium': 'assets/items/yellow-lemon.png',
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.selectedDate = new Date();
    this.loadShortageHistory();
  }

  /**
   * TEMPORARY: static mock data for frontend-only development.
   * Replace this with a real API call once the backend endpoint is ready —
   * just swap the body of this method for an HTTP subscribe, keeping
   * splitByAssignment() and hasData assignment the same.
   */
  loadShortageHistory(): void {
    this.isLoading = true;

    setTimeout(() => {
      const mockData: ShortageItem[] = [
        {
          id: 1,
          itemName: 'Garlic',
          imageUrl: this.getItemImage('Garlic'),
          shortageQty: 20,
          unit: 'kg',
          marketPricePerKg: 100,
          isAssigned: false,
          createdAt: this.formatDateForApi(this.selectedDate || new Date()),
        },
        {
          id: 2,
          itemName: 'Turmeric',
          imageUrl: this.getItemImage('Turmeric'),
          shortageQty: 0.5,
          unit: 'kg',
          marketPricePerKg: 100,
          isAssigned: false,
          createdAt: this.formatDateForApi(this.selectedDate || new Date()),
        },
        {
          id: 3,
          itemName: 'Watermelon',
          imageUrl: this.getItemImage('Watermelon'),
          shortageQty: 20,
          unit: 'kg',
          marketPricePerKg: 100,
          isAssigned: false,
          createdAt: this.formatDateForApi(this.selectedDate || new Date()),
        },
        {
          id: 4,
          itemName: 'Yellow Lemon Premium',
          imageUrl: this.getItemImage('Yellow Lemon Premium'),
          shortageQty: 0.5,
          unit: 'kg',
          marketPricePerKg: 100,
          isAssigned: true,
          assignedCentre: 'D-WPCK-01 Kollupitiya Central ..',
          ceilingPercentage: 2,
          firstAssignedBy: 'Kelum',
          finalizedBy: 'Thilini',
          createdAt: this.formatDateForApi(this.selectedDate || new Date()),
        },
        {
          id: 5,
          itemName: 'Yellow Lemon Premium',
          imageUrl: this.getItemImage('Yellow Lemon Premium'),
          shortageQty: 0.5,
          unit: 'kg',
          marketPricePerKg: 100,
          isAssigned: true,
          assignedCentre: 'D-WPCK-02 Kollupitiya Central ..',
          ceilingPercentage: 2,
          firstAssignedBy: 'Kelum',
          finalizedBy: '',
          createdAt: this.formatDateForApi(this.selectedDate || new Date()),
        },
      ];

      this.shortageItems = mockData;
      this.splitByAssignment();
      this.hasData = this.shortageItems.length > 0;
      this.isLoading = false;
    }, 300);
  }

  private splitByAssignment(): void {
    this.notAssignedItems = this.shortageItems.filter(
      (item) => !item.isAssigned,
    );
    this.assignedItems = this.shortageItems.filter((item) => item.isAssigned);
  }

  onDateChange(event: any): void {
    this.selectedDate = event;
    this.loadShortageHistory();
  }

  clearDate(): void {
    this.selectedDate = null;
    this.loadShortageHistory();
  }

  getItemImage(itemName: string): string {
    const key = (itemName || '').trim().toLowerCase();
    return this.itemImageMap[key] || 'assets/images/items/default-item.png';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }

  getTotalRecords(): string {
    return this.shortageItems.length.toString().padStart(2, '0');
  }

  getNotAssignedCount(): string {
    return this.notAssignedItems.length.toString().padStart(2, '0');
  }

  getAssignedCount(): string {
    return this.assignedItems.length.toString().padStart(2, '0');
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }
}