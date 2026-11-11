import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDriverResidentialBank {
  houseNumber: string;
  streetName: string;
  city: string;
  district: string;
  province: string;
  country: string;
  accHolderName: string;
  accNumber: string;
  bankName: string;
  branchName: string;
}

@Component({
  selector: 'app-driver-residential-bank-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-residential-bank-info.component.html',
  styleUrl: './driver-residential-bank-info.component.css',
})
export class DriverResidentialBankInfoComponent {
  @Input() residentialBankObj!: IDriverResidentialBank;

  get fields(): { label: string; value: string | number | null | undefined }[] {
    const d = this.residentialBankObj;
    return [
      { label: 'House / Plot number', value: d?.houseNumber },
      { label: 'Street Name', value: d?.streetName },
      { label: 'City / Town Name', value: d?.city },
      { label: 'District', value: d?.district },
      { label: 'Province', value: d?.province },
      { label: 'Country', value: d?.country },
      { label: 'Account Holder’s Name', value: d?.accHolderName },
      { label: 'Account Number', value: d?.accNumber },
      { label: 'Bank Name', value: d?.bankName },
      { label: 'Branch Name', value: d?.branchName },
    ];
  }

  show(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '----';
    const text = String(value).trim();
    return text ? text : '----';
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }
}
