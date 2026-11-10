import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DriverPersonalInfoTabComponent,
  IDriverPersonal,
} from '../driver-personal-info-tab/driver-personal-info-tab.component';
import {
  DriverResidentialBankInfoComponent,
  IDriverResidentialBank,
} from '../driver-residential-bank-info/driver-residential-bank-info.component';
import {
  DriverLicenseInsuranceInfoComponent,
  IDriverLicenseInsurance,
} from '../driver-license-insurance-info/driver-license-insurance-info.component';
import {
  DriverVehicaleInfoComponent,
  IDriverVehicle,
} from '../driver-vehicale-info/driver-vehicale-info.component';

@Component({
  selector: 'app-sr-driver-review',
  standalone: true,
  imports: [
    CommonModule,
    DriverPersonalInfoTabComponent,
    DriverResidentialBankInfoComponent,
    DriverLicenseInsuranceInfoComponent,
    DriverVehicaleInfoComponent,
  ],
  templateUrl: './sr-driver-review.component.html',
  styleUrl: './sr-driver-review.component.css',
})
export class SrDriverReviewComponent {
  isLoading: boolean = false;
  activeTab: string = 'Personal';

  // TODO: replace with data from your API
  driverName: string = 'Kasun Perera';
  submittedAt: Date = new Date();

  // TODO: replace with data from your API
  driverData: {
    Personal: IDriverPersonal;
    ResidentialBank: IDriverResidentialBank;
    LicenseInsurance: IDriverLicenseInsurance;
    Vehicle: IDriverVehicle;
  } = {
    Personal: {
      firstName: 'Kasun',
      lastName: 'Perera',
      driverRole: 'Light Weight Driver',
      languages: ['English', 'Sinhala'],
      profileImage: 'https://picsum.photos/600/600',
      mobile1: '0786767588',
      mobile2: null,
      nic: '123456789V',
      email: 'kamalp@gmail.com',
    },
    ResidentialBank: {
      houseNumber: '11/A',
      streetName: 'Galle Road',
      city: 'Dehiwala',
      district: 'Colombo',
      province: 'Western',
      country: 'Sri Lanka',
      accHolderName: 'Kasun Perera',
      accNumber: '111222333',
      bankName: 'Bank of Ceylon',
      branchName: 'Colombo',
    },
    LicenseInsurance: {
      licenseId: 'W10002070',
      licenseFrontImage: 'https://picsum.photos/600/400?random=1',
      licenseBackImage: 'https://picsum.photos/600/400?random=2',
      insuranceNumber: 'WP00001',
      insuranceExpiryDate: new Date('2027-03-11'),
      insuranceFrontImage: 'https://picsum.photos/600/400?random=3',
      insuranceBackImage: 'https://picsum.photos/600/400?random=4',
    },
    Vehicle: {
      registrationNumber: 'W10002070',
      vehicleType: 'Three Wheeler',
      capacity: '100 kg',
      frontImage: 'https://picsum.photos/600/400?random=5',
      backImage: 'https://picsum.photos/600/400?random=6',
      side1Image: 'https://picsum.photos/600/400?random=7',
      side2Image: 'https://picsum.photos/600/400?random=8',
    },
  };

  tabs: { key: string; label: string }[] = [
    { key: 'Personal', label: 'Personal Info' },
    { key: 'ResidentialBank', label: 'Residential & Bank Info' },
    { key: 'LicenseInsurance', label: 'License & Insurance Info' },
    { key: 'Vehicle', label: 'Vehicle Info' },
  ];

  back(): void {
    window.history.back();
  }

  selectTab(tabKey: string): void {
    this.activeTab = tabKey;
  }

  getCurrentTabIndex(): number {
    return this.tabs.findIndex((t) => t.key === this.activeTab);
  }

  goToNextTab(): void {
    const i = this.getCurrentTabIndex();
    if (i < this.tabs.length - 1) {
      this.activeTab = this.tabs[i + 1].key;
      this.scrollToTop();
    }
  }

  goToPreviousTab(): void {
    const i = this.getCurrentTabIndex();
    if (i > 0) {
      this.activeTab = this.tabs[i - 1].key;
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getOrdinal(date: Date): string {
    const d = new Date(date).getDate();
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  openApprovePopUp(): void {
    // TODO: approve popup
  }

  openRejectPopUp(): void {
    // TODO: reject popup
  }
}
