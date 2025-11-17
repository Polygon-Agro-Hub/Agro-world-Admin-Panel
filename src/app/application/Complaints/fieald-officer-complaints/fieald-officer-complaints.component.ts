import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../../services/token/services/token.service';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-fieald-officer-complaints',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  providers: [DatePipe],
  templateUrl: './fieald-officer-complaints.component.html',
  styleUrl: './fieald-officer-complaints.component.css'
})
export class FiealdOfficerComplaintsComponent implements OnInit {
  isLoading = false;
  totalItems: number = 0;
  rpst: string = '';
  replyStatus = [
    { status: 'Yes', value: 'Yes' },
    { status: 'No', value: 'No' },
  ];
  comCategories: ComCategories[] = [];
  complainsData: Complain[] = [];
  filterComCategory: any = '';
  status: Status[] = [];
  filterStatus: any = "";
  searchText: string = "";
  hasData: boolean = true;
  itemsPerPage: number = 10;
  page: number = 1;
  isPopUpVisible: boolean = false;
  selectedLanguage: string = 'English';
  selectedOfficerName: string = '';
  complain: ComplainN = new ComplainN();
  filterCategory: any = {};

  @ViewChild("dropdown") dropdown!: Dropdown;

  constructor(
    private complainSrv: ComplaintsService,
    private router: Router,
    private http: HttpClient,
    private datePipe: DatePipe,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.initializeStatus();
    this.fetchAllComplains(this.page, this.itemsPerPage);
    this.getAllComplainCategories();
  }

  initializeStatus(): void {
    this.status = [
      { id: 1, type: "Assigned" },
      // { id: 2, type: "Pending" },
      { id: 3, type: "Closed" },
    ];
  }

  fetchAllComplains(page: number = 1, limit: number = this.itemsPerPage): void {
    this.isLoading = true;
    this.complainSrv
      .getAllFiealdofficerComplains(
        page,
        limit,
        this.filterStatus?.type,
        this.filterCategory?.type,
        this.filterComCategory?.id,
        this.searchText,
        this.rpst
      )
      .subscribe(
        (res) => {
          this.complainsData = res.results;
          this.totalItems = res.total;
          this.isLoading = false;
          this.hasData = this.complainsData.length > 0;
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching complaints:', error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch complaints",
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
        }
      );
  }

  onPageChange(event: number): void {
    this.page = event;
    this.fetchAllComplains(this.page, this.itemsPerPage);
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchAllComplains(this.page, this.itemsPerPage);
    if (this.dropdown) {
      this.dropdown.hide();
    }
  }

  searchComplain(): void {
    this.page = 1;
    this.fetchAllComplains(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = "";
    this.page = 1;
    this.fetchAllComplains(this.page, this.itemsPerPage);
  }

  viewComplainDetails(id: string): void {
    this.router.navigate([`/complaints/field-officer-complain/${id}`]);
  }

  fetchComplainDetails(id: any, officerName: string, language: string): void {
    this.isLoading = true;
    this.complainSrv.getFieldOfficerComplainById(id).subscribe(
      (res) => {
        res.createdAt = this.datePipe.transform(res.createdAt, "yyyy-MM-dd hh:mm:ss a");
        this.complain = res;
        this.isLoading = false;
        this.showReplyPopUp(officerName, language);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching complaint details:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch complaint details",
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      }
    );
  }

  showReplyPopUp(officerName: string, language: string): void {
    this.selectedOfficerName = officerName;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }

  closeReplyPopUp(): void {
    this.isPopUpVisible = false;
    this.selectedOfficerName = '';
    this.selectedLanguage = 'English';
  }

  getAllComplainCategories(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const role = this.tokenService.getUserDetails().role;
    let url = '';

    if (role === "1") {
      url = `${environment.API_URL}auth/get-all-complain-category-list-super/5`;
    } else {
      url = `${environment.API_URL}auth/get-all-complain-category-list/${role}/5`;
    }

    this.http.get<any>(url, { headers }).subscribe(
      (response) => {
        this.comCategories = response;
      },
      (error) => {
        console.error('Error fetching complain categories:', error);
      }
    );
  }

  getOfficerName(item: Complain): string {
    switch (this.selectedLanguage) {
      case 'Sinhala':
        return item.officerNameSinhala || item.officerName;
      case 'Tamil':
        return item.officerNameTamil || item.officerName;
      default:
        return item.officerName;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Opened':
        return 'bg-green-100 text-green-500';
      case 'Pending':
        return 'bg-[#FFB9B7] text-[#D16D6A]';
      case 'Closed':
        return 'bg-[#F8FFA6] text-[#A8A100]';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  }

  back(): void {
    this.router.navigate(['complaints']);
  }
}

class ComCategories {
  id!: number;
  categoryEnglish!: string;
}

class Status {
  id!: number;
  type!: string;
}

class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  empId!: string;
  companyName!: string;
  role!: string;
  complain!: string;
  complainCategory!: string;
  createdAt!: string;
  reply!: string;
  regCode!: string;
  CollectionContact!: string;
  officerName!: string;
  officerNameSinhala!: string;
  officerNameTamil!: string;
  officerPhone!: string;
  farmerName!: string;
  language!: string;
  adminReplyByName!: string;
}

class ComplainN {
  id!: string;
  refNo!: string;
  status!: string;
  firstName!: string;
  lastName!: string;
  phoneCode01!: string;
  phoneNumber01!: string;
  complain!: string;
  complainCategory!: string;
  language!: string;
  createdAt!: string;
  reply!: string;
  centerName!: string;
  CollectionContact!: string;
  officerName!: string;
  officerPhone!: string;
  farmerName!: string;
  jobRole!: string;
  empId!: string;
}