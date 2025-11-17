import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { TokenService } from '../../../services/token/services/token.service';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-collection-center-view-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  providers: [DatePipe],
  templateUrl: './collection-center-view-complain.component.html',
  styleUrl: './collection-center-view-complain.component.css',
})
export class CollectionCenterViewComplainComponent implements OnInit {

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

  @ViewChild("dropdown") dropdown!: Dropdown;

  constructor(
    private complainSrv: CollectionCenterService,
    private datePipe: DatePipe,
    private router: Router,
    private http: HttpClient,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }




  ngOnInit(): void {


    this.status = [
      { id: 1, type: "Assigned" },
      { id: 2, type: "Pending" },
      { id: 3, type: "Closed" },
    ];

    this.category = [
      { id: 1, type: "Agriculture" },
      { id: 2, type: "Finance" },
      { id: 3, type: "Call Center" },
      { id: 4, type: "Procuiment" },
    ];

    if (this.tokenService.getUserDetails().role === "2") {
      this.filterCategory.type = "Agriculture";
    } else if (this.tokenService.getUserDetails().role === "3") {
      this.filterCategory.type = "Finance";
    }
    else if (this.tokenService.getUserDetails().role === "4") {
      this.filterCategory.type = "Call Center";
    } 
    else if (this.tokenService.getUserDetails().role === "5") {
      this.filterCategory.type = "Procuiment";
    }

    this.fetchAllComplain(this.page, this.itemsPerPage);
    this.getAllComplainCategories();
    this.getAllCompanyForOfficerComplain();
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.complainSrv
      .getAllCenterComplain(
        page,
        limit,
        this.filterStatus?.type,
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
    this.page = 1;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = "";
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  navigateSelectComplain(id: string) {
    this.router.navigate([
      `/complaints/view-center-complain/${id}`,
    ]);
  }


  fetchComplain(id: any, farmerName: string, language: string) {
    this.isLoading = true;
    this.complainSrv.getCenterComplainById(id).subscribe((res) => {
      res.createdAt =
        this.datePipe.transform(res.createdAt, "yyyy-MM-dd hh:mm:ss a");
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



  submitComplaint(id: any) {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error("No token found");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = { reply: this.messageContent };

    this.http
      .put(`${environment.API_URL}auth/reply-center-complain/${id}`, body, { headers })
      .subscribe(
        (res: any) => {

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Reply sent successfully!",
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          this.fetchAllComplain(this.page, this.itemsPerPage);
        },
        (error) => {
          console.error("Error updating news", error);

          Swal.fire({
            icon: "error",
            title: "Unsuccessful",
            text: "Error updating news",
          });
          this.fetchAllComplain(this.page, this.itemsPerPage);
        },
      );
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
      .get<any>(`${environment.API_URL}auth/get-all-comppany-for-officer-complain`, {
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

