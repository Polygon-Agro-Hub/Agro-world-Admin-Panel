import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component'; // adjust path
import {
  BuyerRow,
  MarketPlaceService,
} from '../../../services/market-place/market-place.service';

@Component({
  selector: 'app-total-buyer-value',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './total-buyer-value.component.html',
  styleUrl: './total-buyer-value.component.css',
})

export class TotalBuyerValueComponent implements OnInit {
  isLoading = false;
  hasData = true;

  searchItem = '';
  selectedAgent: string | null = null;

  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  agentOptions: { label: string; value: string }[] = [];
  buyers: BuyerRow[] = [];
  fullTotal = 0;

  constructor(
    private location: Location,
    private marketPlaceService: MarketPlaceService,
  ) {}

  ngOnInit(): void {
    this.fetchBuyers(this.page, this.itemsPerPage);
  }

  back(): void {
    this.location.back();
  }

  fetchBuyers(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    searchItem: string = this.searchItem,
    agent: string | null = this.selectedAgent,
  ): void {
    this.isLoading = true;
    this.marketPlaceService
      .getTotalBuyerValue(page, limit, searchItem, agent)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.buyers = res.items;
          this.totalItems = res.total;
          this.fullTotal = res.fullTotal;
          this.hasData = this.buyers.length > 0;

          this.agentOptions = (res.agents || []).map((a) => ({
            label: a,
            value: a,
          }));
        },
        error: (err) => {
          console.error('Failed to load total buyer value', err);
          this.isLoading = false;
          this.buyers = [];
          this.totalItems = 0;
          this.fullTotal = 0;
          this.hasData = false;
        },
      });
  }

  formatAmount(value: number): string {
    return (value ?? 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onPageChange(event: number): void {
    this.page = event;
    this.fetchBuyers(this.page, this.itemsPerPage);
  }

  onAgentChange(): void {
    this.page = 1;
    this.fetchBuyers(this.page, this.itemsPerPage);
  }

  onSearch(): void {
    this.searchItem = this.searchItem.trim();
    this.page = 1;
    this.fetchBuyers(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchItem = '';
    this.page = 1;
    this.fetchBuyers(this.page, this.itemsPerPage);
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    if (event.key === ' ' && this.searchItem.length === 0) {
      event.preventDefault();
    }
  }
}