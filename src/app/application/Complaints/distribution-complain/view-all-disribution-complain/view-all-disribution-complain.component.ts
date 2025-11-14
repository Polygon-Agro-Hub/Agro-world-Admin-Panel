import { CommonModule, DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../../../services/token/services/token.service';
import { environment } from '../../../../environment/environment.development';
import Swal from 'sweetalert2';
import { ComplaintsService } from '../../../../services/complaints/complaints.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-view-all-disribution-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-all-disribution-complain.component.html',
  styleUrl: './view-all-disribution-complain.component.css'
})
export class ViewAllDisributionComplainComponent {
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  filterStatus: any = "";
  filterCategory: any = {};
  status!: Status[];
  category!: Category[];
  complainsData!: Complain[];
  searchText: string = "";
  isLoading = false;
  messageContent: string = "";
  complain: ComplainN = new ComplainN();
  comCategories: ComCategories[] = [];
  company: Company[] = [];
  filterComCategory: any = '';
  filterCompany: any = '';
  hasData: boolean = true;

  isPopUpVisible: boolean = false;
  selectedLanguage: string = 'English';
  selectedOfficerName: string = '';


  rpst: string = '';
  replyStatus = [
    { status: 'Yes', value: 'Yes' },
    { status: 'No', value: 'No' },
  ];

  statusfilterArr = [
    { label: 'Assigned', value: 'Assigned' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Pending', value: 'Pending' },

  ]

  @ViewChild("dropdown") dropdown!: Dropdown;




  constructor(
    private router: Router,
    private http: HttpClient,
    private distributedComplainSrv: ComplaintsService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }




  ngOnInit(): void {


    this.fetchAllComplain(this.page, this.itemsPerPage);
    this.getAllComplainCategories();
    this.getAllCompanyForOfficerComplain();
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.distributedComplainSrv
      .getAllCenterComplain(
        page,
        limit,
        this.filterStatus,
        this.filterCategory?.type,
        this.filterComCategory?.id,
        this.filterCompany?.id,
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
        },
      );
  }

  regStatusFil() {
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllComplain(this.page, this.itemsPerPage);
    if (this.dropdown) {
      this.dropdown.hide();
    }
  }

  searchComplain() {
    this.searchText = this.searchText?.trim() || ''
    this.page = 1;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = "";
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  navigateSelectComplain(id: string) {
    this.router.navigate([
      `/complaints/distributed-center-complains/view-complain/${id}`,
    ]);
  }


  fetchComplain(id: any, farmerName: string, language: string) {
    this.isLoading = true;
    this.distributedComplainSrv.getDistributionComplainById(id).subscribe((res) => {

      this.complain = res;
      this.isLoading = false;
      this.showReplyPopUp(farmerName, language);
    });
  }

  showReplyPopUp(fname: string, language: string) {
    this.selectedOfficerName = fname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }

  getAllComplainCategories() {

    if (this.tokenService.getUserDetails().role === "1") {
      const token = this.tokenService.getToken();

      if (!token) {
        console.error('No token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .get<any>(`${environment.API_URL}auth/get-all-complain-category-list-super/2`, {
          headers,
        })
        .subscribe(
          (response) => {
            this.comCategories = response;
          },
          (error) => {
            console.error('Error fetching news:', error);
          }
        );
    } else {
      const token = this.tokenService.getToken();

      if (!token) {
        console.error('No token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .get<any>(`${environment.API_URL}auth/get-all-complain-category-list/${this.tokenService.getUserDetails().role}/2`, {
          headers,
        })
        .subscribe(
          (response) => {
            this.comCategories = response;
          },
          (error) => {
            console.error('Error fetching news:', error);
          }
        );
    }

  }

  getAllCompanyForOfficerComplain() {

    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<any>(`${environment.API_URL}complain/get-distribution-comppany-for-officer-complain`, {
        headers,
      })
      .subscribe(
        (response) => {
          this.company = response;
        },
        (error) => {
          console.error('Error fetching news:', error);
        }
      );

  }

  back(): void {
    this.router.navigate(['complaints']);
  }

  closeReplyPopUp() {
    this.isPopUpVisible = false;
    this.selectedOfficerName = 'English';
    this.selectedLanguage = '';

  }
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
}

class Status {
  id!: number;
  type!: string;
}

class Category {
  id!: number;
  type!: string;
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
}


class ComCategories {
  id!: number;
  categoryEnglish!: string;
}

class Company {
  id!: number;
  companyNameEnglish!: string;
}

