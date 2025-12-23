import { Component, Input, input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-personal-info-tab',
  standalone: true,
  imports: [],
  templateUrl: './personal-info-tab.component.html',
  styleUrl: './personal-info-tab.component.css'
})
export class PersonalInfoTabComponent implements OnChanges {
  @Input() personalArr!: Question[];

  ngOnChanges(): void {
    console.log('-----------------------------------------------------------------------------------');
    console.log(this.personalArr);
    console.log('-----------------------------------------------------------------------------------');
    
  }

}

interface Question {
  answer: any;
  qIndex: number
  ansType: string
  quaction: string;
}
