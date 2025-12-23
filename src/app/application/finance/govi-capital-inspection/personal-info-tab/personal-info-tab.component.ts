import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-personal-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-info-tab.component.html',
  styleUrl: './personal-info-tab.component.css',
})
export class PersonalInfoTabComponent implements OnChanges {
  @Input() personalArr!: Question[];

  sortedPersonalArr: Question[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personalArr'] && this.personalArr) {
      this.sortedPersonalArr = [...this.personalArr].sort(
        (a, b) => a.qIndex - b.qIndex
      );
    }
  }

  // Helper method to format the index with leading zero
  formatIndex(index: number): string {
    return index < 10 ? `0${index}` : `${index}`;
  }
}

interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
}
