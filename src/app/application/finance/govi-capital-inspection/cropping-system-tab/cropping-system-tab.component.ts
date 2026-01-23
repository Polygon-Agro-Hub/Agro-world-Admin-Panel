import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cropping-system-tab',
  standalone: true,
  imports: [],
  templateUrl: './cropping-system-tab.component.html',
  styleUrl: './cropping-system-tab.component.css',
})
export class CroppingSystemTabComponent {
  @Input() croppingData!: ICropping;
  @Input() currentPage: number = 7;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }
}

interface ICropping {
  opportunity: string[];
  otherOpportunity: string;
  hasKnowlage: number;
  prevExperince: string;
  opinion: string;
}
