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
  @Input() personalObj!: IPersonal;

  // sortedPersonalArr: IPersonal[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.personalObj);
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
