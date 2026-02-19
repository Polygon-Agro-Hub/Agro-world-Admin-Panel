import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-harvest-storage-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './harvest-storage-tab.component.html',
  styleUrl: './harvest-storage-tab.component.css'
})
export class HarvestStorageTabComponent implements OnChanges {

  @Input() HarvestObj!: IHarvest;
  @Input() currentPage: number = 11;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('---------------------------------------------------------------');
    console.log(this.HarvestObj);
    
  }

}

interface IHarvest {
  id: number
  reqId: string
  hasOwnStorage: number
  hasPrimaryProcessingAccess: number
  ifNotHasFacilityAccess: number
  knowsValueAdditionTech: number
  hasValueAddedMarketLinkage: number
  awareOfQualityStandards: number
  createdAt: Date
}
