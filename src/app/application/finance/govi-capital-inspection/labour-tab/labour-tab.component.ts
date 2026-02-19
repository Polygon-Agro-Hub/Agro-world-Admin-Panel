import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-labour-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './labour-tab.component.html',
  styleUrl: './labour-tab.component.css'
})
export class LabourTabComponent implements OnChanges {

  @Input() LaborObj!: ILabor;
  @Input() currentPage: number = 10;
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
    console.log(this.LaborObj);
    
  }

}

interface ILabor {
  id: number
  reqId: string
  isManageFamilyLabour: number
  isFamilyHiredLabourEquipped: number
  hasAdequateAlternativeLabour: number
  areThereMechanizationOptions: number
  isMachineryAvailable: number
  isMachineryAffordable: number
  isMachineryCostEffective: number
  createdAt: Date
}
