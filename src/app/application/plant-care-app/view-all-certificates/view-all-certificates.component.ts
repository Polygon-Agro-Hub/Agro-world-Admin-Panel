import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateCompanyService } from '../../../services/plant-care/certificate-company.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-all-certificates',
  standalone: true,
  imports: [FormsModule, CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './view-all-certificates.component.html',
  styleUrl: './view-all-certificates.component.css',
})
export class ViewAllCertificatesComponent implements OnInit {
  certificateArr: CertificateData[] = [];
  companyArr: Company[] = [];

  isLoading: boolean = true;
  hasData: boolean = false;
  searchText: string = '';
  selectQaction: string = '';
  selectArea: string = '';
  selectCompany: any = '';

  isServicePopUp: boolean = false;
  serviceAreaArray: any = [];

  QuactionFilter: any = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  serviceAreasOptions = [
    { name: 'Ampara', value: 'Ampara' },
    { name: 'Anuradhapura', value: 'Anuradhapura' },
    { name: 'Badulla', value: 'Badulla' },
    { name: 'Batticaloa', value: 'Batticaloa' },
    { name: 'Colombo', value: 'Colombo' },
    { name: 'Galle', value: 'Galle' },
    { name: 'Gampaha', value: 'Gampaha' },
    { name: 'Hambantota', value: 'Hambantota' },
    { name: 'Jaffna', value: 'Jaffna' },
    { name: 'Kalutara', value: 'Kalutara' },
    { name: 'Kandy', value: 'Kandy' },
    { name: 'Kegalle', value: 'Kegalle' },
    { name: 'Kilinochchi', value: 'Kilinochchi' },
    { name: 'Kurunegala', value: 'Kurunegala' },
    { name: 'Mannar', value: 'Mannar' },
    { name: 'Matale', value: 'Matale' },
    { name: 'Matara', value: 'Matara' },
    { name: 'Monaragala', value: 'Monaragala' },
    { name: 'Mullaitivu', value: 'Mullaitivu' },
    { name: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { name: 'Polonnaruwa', value: 'Polonnaruwa' },
    { name: 'Puttalam', value: 'Puttalam' },
    { name: 'Rathnapura', value: 'Rathnapura' },
    { name: 'Trincomalee', value: 'Trincomalee' },
    { name: 'Vavuniya', value: 'Vavuniya' },
  ];

  constructor(
    private certificateSrv: CertificateCompanyService,
    private router: Router // private location: Location,
  ) { }

  ngOnInit(): void {
    this.fetchCompany();
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    console.log(this.selectQaction);

    this.searchText = this.searchText.trim();
    this.certificateSrv
      .getAllCertificates(
        this.selectQaction,
        this.selectArea,
        this.selectCompany,
        this.searchText
      )
      .subscribe((res) => {
        console.log(res);
        this.certificateArr = res.data;
        this.isLoading = false;
        this.hasData = this.certificateArr.length > 0;
      });
  }

  fetchCompany() {
    this.certificateSrv.getAllCompaniesNamesOnly().subscribe((res) => {
      this.companyArr = res;
    });
  }

  onSearch() {
    this.fetchData();
  }

  offSearch() {
    this.searchText = '';
    this.fetchData();
  }

  applyFilters() { }

  editCertificate(item: CertificateData) {
    this.router.navigate([
      `/plant-care/action/edit-certificate-details/${item.id}`,
    ]);
  }

  viewCertificate(item: CertificateData) {
    this.router.navigate([
      `/plant-care/action/view-certificate-details/${item.id}`,
    ]);
  }

  deleteCertificate(item: CertificateData) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        this.certificateSrv.deleteCertificate(item.id).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.status) {
              Swal.fire({
                title: 'Deleted!',
                text: res.message,
                icon: 'success',
                customClass: {
                  popup:
                    'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
              this.fetchData();
            } else {
              Swal.fire({
                title: 'Error',
                text: res.message || 'Failed to delete certificate.',
                icon: 'error',
                customClass: {
                  popup:
                    'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error deleting certificate:', err);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete company.',
              icon: 'error',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate([`/plant-care/action/`]);
  }

  addNew() {
    this.router.navigate(['/plant-care/action/add-certificate-details']);
  }

  navigateToQuestionnaire(item: CertificateData) {
    const path =
      item.qCount === 0
        ? `/plant-care/action/add-questionnaire-details/${item.id}`
        : `/plant-care/action/edit-questionnaire-details/${item.id}`;

    this.router.navigate([path]);
  }

  servicePopUpOpen(areas: string) {
    this.serviceAreaArray = areas.split(',').map(area => area.trim());
    this.isServicePopUp = true;
  }

  servicePopUpClose() {
    this.serviceAreaArray = [];
    this.isServicePopUp = false;
  }
}

class CertificateData {
  id!: number;
  srtName!: string;
  srtNumber!: string;
  commission!: number;
  serviceAreas!: string;
  qCount!: number;
  modifiedByUser!: string;
  modifyDate!: string;
  companyName!: string;
}

class Company {
  id!: number;
  companyName!: string;
}
