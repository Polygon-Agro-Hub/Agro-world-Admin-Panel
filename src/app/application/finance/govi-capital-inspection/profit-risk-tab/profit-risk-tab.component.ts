import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface InvestmentDataItem {
  id: string;
  label: string;
  type: string;
  value: string | number;
}

@Component({
  selector: 'app-profit-risk-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profit-risk-tab.component.html',
  styleUrl: './profit-risk-tab.component.css'
})
export class ProfitRiskTabComponent {
  investmentData: InvestmentDataItem[] = [
    {
      id: '01',
      label: 'How much profit are you expecting from the proposed crop / cropping system?',
      type: 'currency',
      value: 'Rs. 1,300,000.00'
    },
    {
      id: '02',
      label: 'Is this profitable than the existing crop / cropping system?',
      type: 'boolean',
      value: 'Yes'
    },
    {
      id: '03',
      label: 'Are there any risks?',
      type: 'boolean',
      value: 'Yes'
    },
    {
      id: '04',
      label: 'What are the risks you are anticipating in the proposed crop / cropping system?',
      type: 'text',
      value: 'Flood'
    },
    {
      id: '05',
      label: 'Do you have the solution?',
      type: 'boolean',
      value: 'Yes'
    },
    {
      id: '06',
      label: 'Can the farmer manage the risks?',
      type: 'boolean',
      value: 'Yes'
    },
    {
      id: '07',
      label: 'Is it worth to take risks for anticipated profits?',
      type: 'boolean',
      value: 'Yes'
    }
  ];
}