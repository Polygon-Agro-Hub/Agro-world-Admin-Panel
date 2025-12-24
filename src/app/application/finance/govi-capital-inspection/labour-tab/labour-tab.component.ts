import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface InvestmentDataItem {
  id: number;
  label: string;
  type: string;
  value: any;
}

@Component({
  selector: 'app-labour-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './labour-tab.component.html',
  styleUrl: './labour-tab.component.css'
})
export class LabourTabComponent {
  investmentData: InvestmentDataItem[] = [
    {
      id: 1,
      label: "Can the farmer manage the proposed crop / cropping system through family labour?",
      type: "boolean",
      value: "No"
    },
    {
      id: 2,
      label: "If not, do you have adequate labours to manage the same?",
      type: "boolean",
      value: "No"
    },
    {
      id: 3,
      label: "Is family/hired labour equipped to handle the proposed crop/cropping system?",
      type: "boolean",
      value: "Yes"
    },
    {
      id: 4,
      label: "Are there any mechanization options to substitute the labour?",
      type: "boolean",
      value: "Yes"
    },
    {
      id: 5,
      label: "Is machinery available?",
      type: "boolean",
      value: "Yes"
    },
    {
      id: 6,
      label: "Is machinery affordable?",
      type: "boolean",
      value: "Yes"
    },
    {
      id: 7,
      label: "Is machinery cost effective?",
      type: "boolean",
      value: "Yes"
    }
  ];
}