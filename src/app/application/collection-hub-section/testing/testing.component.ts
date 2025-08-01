import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Country, COUNTRIES } from './../../../../assets/country-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testing',
  standalone: true,
  imports: [FormsModule, DropdownModule, InputTextModule, CommonModule],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.css'
})
export class TestingComponent {
  countries: Country[] = COUNTRIES;
  selectedCountry: Country | null = null;
  phoneNumber: string = '';
  selectedDialCode: string = '+94';

  constructor() {
    // Set Sri Lanka as default
    this.selectedCountry = this.countries.find(c => c.code === 'lk') || null;
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/24x18/${code}.png`;
  }
}
