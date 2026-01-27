import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FarmerPensionService } from '../../../services/plant-care/farmer-pension.service';

@Component({
  selector: 'app-view-farmer-pension-5-years-plus',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, NgxPaginationModule],
  templateUrl: './view-farmer-pension-5-years-plus.component.html',
  styleUrl: './view-farmer-pension-5-years-plus.component.css'
})
export class ViewFarmerPension5YearsPlusComponent {
searchText: string = '';
  isLoading = false;
  showDetailsModal = false;
  dataObject: Farmer | null = null;

  farmers: Farmer[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(private farmerPensionService: FarmerPensionService) {}

  ngOnInit(): void {
    this.loadFarmers();
  }

  loadFarmers() {
    this.isLoading = true;
    this.farmerPensionService
      .getFarmers5YearsPlus(
        this.currentPage,
        this.itemsPerPage,
        this.searchText || undefined,
      )
      .subscribe({
        next: (response) => {
          // Filter to show only farmers who have completed 5 years or more
          const filteredItems = response.items.filter((item) => {
            return this.is5YearsPlus(item.approveTime);
          });

          this.totalItems = filteredItems.length;
          this.farmers = filteredItems.map((item, index) => ({
            no: ((this.currentPage - 1) * this.itemsPerPage + index + 1)
              .toString()
              .padStart(3, '0'),
            name: item.fullName,
            farmerFullName: item.farmerFullName,
            nic: item.nic,
            phoneNumber: item.phoneNumber,
            dob: item.dob,
            age: this.calculateAge(item.dob),
            amount: this.calculatePensionValue(
              item.approveTime,
              parseFloat(item.defaultPension),
            ),
            duration: this.calculateDuration(item.approveTime),
            approvedBy: item.approveBy || 'N/A',
            approvedDate: this.formatApproveDate(item.approveTime),
            successor: item.sucType || 'N/A',
            successorNic: item.sucNic || 'N/A',
            successorDob: item.sucdob || null,
            successorAge: item.sucdob ? this.calculateAge(item.sucdob) : 'N/A',
            rawData: item,
          }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading farmers:', err);
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadFarmers();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadFarmers();
  }

  clearSearch() {
    this.searchText = '';
    this.currentPage = 1;
    this.loadFarmers();
  }

  // Check if farmer has completed 5 years or more from approval date
  private is5YearsPlus(approveTimeStr: string | null): boolean {
    if (!approveTimeStr) return false;

    const approveDate = new Date(approveTimeStr);
    const currentDate = new Date();

    // Reject future approval dates (invalid data)
    if (approveDate > currentDate) {
      return false;
    }

    // Calculate the 5 year mark from approval date
    const fiveYearsLater = new Date(approveDate);
    fiveYearsLater.setFullYear(approveDate.getFullYear() + 5);

    // Return true if current date is at or after the 5 year mark
    return currentDate >= fiveYearsLater;
  }

  // Calculate duration from approval date to current date
  private calculateDuration(approveTimeStr: string | null): string {
    if (!approveTimeStr) return 'N/A';

    const approveDate = new Date(approveTimeStr);
    const currentDate = new Date();

    if (currentDate < approveDate) {
      return 'N/A';
    }

    let years = currentDate.getFullYear() - approveDate.getFullYear();
    let months = currentDate.getMonth() - approveDate.getMonth();
    let days = currentDate.getDate() - approveDate.getDate();

    // Adjust negative days
    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += prevMonth.getDate();
    }

    // Adjust negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Build the string
    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    }
    if (days > 0 && years === 0 && months === 0) {
      parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 Days';
  }

  // Calculate age from date of birth
  private calculateAge(dobStr: string | null): string {
    if (!dobStr) return 'N/A';

    const dob = new Date(dobStr);
    const today = new Date();

    // Use UTC dates to avoid timezone issues
    const dobYear = dob.getUTCFullYear();
    const dobMonth = dob.getUTCMonth();
    const dobDay = dob.getUTCDate();

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    let years = todayYear - dobYear;
    let months = todayMonth - dobMonth;

    // Adjust if birthday hasn't occurred yet this year
    if (months < 0 || (months === 0 && todayDay < dobDay)) {
      years--;
      months = months < 0 ? months + 12 : 11;
    }

    // Adjust if day hasn't occurred yet this month
    if (todayDay < dobDay && months > 0) {
      months--;
    }

    // Ensure non-negative values
    years = Math.max(years, 0);
    months = Math.max(months, 0);

    return `${years} Years, ${months} ${months === 1 ? 'Month' : 'Months'}`;
  }

  // Calculate if a year is a leap year
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // Get days in a year
  private getDaysInYear(year: number): number {
    return this.isLeapYear(year) ? 366 : 365;
  }

  // Calculate current pension value
  private calculatePensionValue(
    startDateStr: string,
    yearlyAmount: number,
  ): number {
    const startDate = new Date(startDateStr);
    const currentDate = new Date();

    if (currentDate < startDate) {
      return 0;
    }

    // Calculate total days between start and current date
    const totalDays = Math.floor(
      (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    // Calculate full years passed
    const fullYearsPassed = Math.floor(totalDays / 365.25);

    // Calculate base amount from full years
    const baseAmount = fullYearsPassed * yearlyAmount;

    // Calculate days in current incomplete year
    const daysInCurrentYear = totalDays - fullYearsPassed * 365.25;

    if (daysInCurrentYear <= 0) {
      return baseAmount;
    }

    // Calculate current year
    const currentYear = startDate.getFullYear() + fullYearsPassed;
    const daysInYear = this.getDaysInYear(currentYear);

    // Calculate amount for partial year
    const dailyRate = yearlyAmount / daysInYear;
    const partialAmount = dailyRate * daysInCurrentYear;

    return baseAmount + partialAmount;
  }

  // Calculate remaining time until 5 years
  private calculateRemainingTime(startDateStr: string): string {
    const startDate = new Date(startDateStr);
    const currentDate = new Date();
    const eligibleDate = new Date(startDate);
    eligibleDate.setFullYear(startDate.getFullYear() + 5);

    if (currentDate >= eligibleDate) {
      return 'Eligible';
    }

    let years = eligibleDate.getFullYear() - currentDate.getFullYear();
    let months = eligibleDate.getMonth() - currentDate.getMonth();
    let days = eligibleDate.getDate() - currentDate.getDate();

    // Adjust negative days
    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      );
      days += prevMonth.getDate();
    }

    // Adjust negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Build the string
    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    }
    if (days > 0 || parts.length === 0) {
      parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
    }

    return parts.join(' ');
  }

  // Format approve date
  private formatApproveDate(approveTime: string | null): string {
    if (!approveTime) {
      return 'N/A';
    }
    const date = new Date(approveTime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return `${displayHours}:${minutes}${ampm} ${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  }

  viewDetails(farmer: Farmer) {
    this.dataObject = farmer;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  back() {
    window.history.back();
  }

  get hasData(): boolean {
    return this.farmers.length > 0;
  }
}

interface Farmer {
  no: string;
  name: string;
  farmerFullName: string;
  nic: string;
  phoneNumber: string;
  dob: string;
  age: string;
  amount: number;
  duration: string;
  approvedBy: string;
  approvedDate: string;
  successor: string;
  successorNic: string;
  successorDob: string | null;
  successorAge: string;
  rawData?: any;
}
