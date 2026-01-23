import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-personal-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-info-tab.component.html',
  styleUrl: './personal-info-tab.component.css',
})
export class PersonalInfoTabComponent implements OnChanges {
  @Input() personalObj!: IPersonal;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  // sortedPersonalArr: IPersonal[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.personalObj);
  }

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }
}

interface IPersonal {
  firstName: string;
  lastName: string;
  otherName: string;
  callName: string;
  phone1: string;
  phone2: string;
  familyPhone: string;
  landHome: string;
  landWork: string;
  email1: string;
  email2: string;
  house: string;
  street: string;
  city: string;
  country: string;
  district: string;
  province: string;
}
