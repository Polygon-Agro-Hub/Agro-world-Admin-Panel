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

  @ViewChild("dropdown") dropdown!: Dropdown;




  constructor(
    private complainSrv: CollectionCenterService,
    // private datePipe: DatePipe,
    private router: Router,
    // private tokenService: TokenService,
    private http: HttpClient,
    public tokenService: TokenService,
    private distributedComplainSrv: ComplaintsService
  ) { }




  ngOnInit(): void {


    // this.status = [
    //   { id: 1, type: "Assigned" },
    //   { id: 2, type: "Pending" },
    //   { id: 3, type: "Closed" },
    // ];

    // this.category = [
    //   { id: 1, type: "Agriculture" },
    //   { id: 2, type: "Finance" },
    //   { id: 3, type: "Call Center" },
    //   { id: 4, type: "Procuiment" },
    // ];

    // if (this.tokenService.getUserDetails().role === "2") {
    //   this.filterCategory.type = "Agriculture";
    // } else if (this.tokenService.getUserDetails().role === "3") {
    //   this.filterCategory.type = "Finance";
    // } else if (this.tokenService.getUserDetails().role === "4") {
    //   this.filterCategory.type = "Call Center";
    // } else if (this.tokenService.getUserDetails().role === "5") {
    //   this.filterCategory.type = "Procuiment";
    // }

    console.log(this.filterCategory);
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
        this.filterStatus?.type,
        this.filterCategory?.type,
        this.filterComCategory?.id,
        this.filterCompany?.id,
        this.searchText,
        this.rpst
      )
      .subscribe(
        (res) => {
          console.log('results', res.results);

          // Map response data to ensure createdAt is in a readable date format

          this.complainsData = res.results;
          this.totalItems = res.total;
          this.isLoading = false;
          this.hasData = this.complainsData.length > 0;
        },
        (error) => {
          console.log("Error: ", error);
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
      this.dropdown.hide(); // Close the dropdown after selection
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
    this.distributedComplainSrv.getDistributionComplainById(id).subscribe((res) => {
      // res.createdAt =
      //   this.datePipe.transform(res.createdAt, "yyyy-MM-dd hh:mm:ss a");
      this.complain = res;
      console.log(res);
      this.isLoading = false;
      // this.showReplyDialog(id, farmerName);
      this.showReplyPopUp(farmerName, language);
    });
  }

  showReplyPopUp(fname: string, language: string) {
    this.selectedOfficerName = fname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }



  // submitComplaint(id: any) {
  //   const token = this.tokenService.getToken();
  //   if (!token) {
  //     console.error("No token found");
  //     return;
  //   }

  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });

  //   console.log(id);
  //   console.log(this.messageContent);

  //   const body = { reply: this.messageContent };

  //   this.http
  //     .put(`${environment.API_URL}auth/reply-center-complain/${id}`, body, { headers })
  //     .subscribe(
  //       (res: any) => {
  //         console.log("Reply sent successfully", res);

  //         Swal.fire({
  //           icon: "success",
  //           title: "Success",
  //           text: "Reply sent successfully!",
  //           customClass: {
  //             popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
  //             title: 'font-semibold',
  //           },
  //         });
  //         this.fetchAllComplain(this.page, this.itemsPerPage);
  //       },
  //       (error) => {
  //         console.error("Error updating news", error);

  //         Swal.fire({
  //           icon: "error",
  //           title: "Unsuccessful",
  //           text: "Error updating news",
  //         });
  //         this.fetchAllComplain(this.page, this.itemsPerPage);
  //       },
  //     );
  // }






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
            console.log('Complain Categories:', this.comCategories);
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
            console.log('Complain Categories:', this.comCategories);
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
          console.log('Complain Categories:', this.company);
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

