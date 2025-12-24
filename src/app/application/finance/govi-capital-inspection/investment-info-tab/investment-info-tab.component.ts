import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-investment-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-info-tab.component.html',
  styleUrl: './investment-info-tab.component.css'
})
export class InvestmentInfoTabComponent {
  // Dummy data based on the image
  investmentData = [
    {
      id: '01',
      label: 'Expected investment by the farmer',
      value: 'Rs. 1,8000,000,00',
      type: 'text'
    },
    {
      id: '02',
      label: 'Purpose for investment required as per the farmer',
      value: 'Buy agro input supplies',
      type: 'text'
    },
    {
      id: '03',
      label: 'Expected repayment period as per the farmer in months',
      value: '12',
      type: 'text'
    }
  ];
}