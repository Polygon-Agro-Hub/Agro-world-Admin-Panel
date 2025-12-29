import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cropping-system-tab',
  standalone: true,
  imports: [],
  templateUrl: './cropping-system-tab.component.html',
  styleUrl: './cropping-system-tab.component.css',
})
export class CroppingSystemTabComponent {
  @Input() croppingData!: ICropping;
}

interface ICropping {
  opportunity: string[];
  otherOpportunity: string;
  hasKnowlage: number;
  prevExperince: string;
  opinion: string;
}
