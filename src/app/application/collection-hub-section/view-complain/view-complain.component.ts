import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Dropdown, DropdownModule } from "primeng/dropdown";
import { CollectionCenterService } from "../../../services/collection-center/collection-center.service";
import { NgxPaginationModule } from "ngx-pagination";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { TokenService } from "../../../services/token/services/token.service";
import { environment } from "../../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-view-complain",
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  providers: [DatePipe], // Provide DatePipe for date formatting
  templateUrl: "./view-complain.component.html",
  styleUrls: ["./view-complain.component.css"],
})
export class ViewComplainComponent implements OnInit {

  showReplyModal: boolean = false;
  selectedLanguage: string = 'English';
  selectedFarmerName: string = '';
  selectedReply: string = '';
  selectedComplainId: any;

  statusFilter: any;
  hasData: boolean = true;
  complainsData!: Complain[];
  complain: ComplainIn = new ComplainIn();
  messageContent: string = "";
  @ViewChild("dropdown") dropdown!: Dropdown;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  filterStatus: any = "";
  filterCategory: any = {};
  filterComCategory: any = '';
  status!: Status[];
  category!: Category[];
  isPopUpVisible: boolean = false;


  searchText: string = "";
  isLoading = false;
  comCategories: ComCategories[] = [];

  rpst: string = '';
  replyStatus = [
    { status: 'Yes', value: 'Yes' },
    { status: 'No', value: 'No' },

  ];

  constructor(
    private complainSrv: CollectionCenterService,
    private datePipe: DatePipe,
    private router: Router,
    // private tokenService: TokenService,
    private http: HttpClient,
    public tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    console.log('user role', this.tokenService.getUserDetails().role);


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
    } else if (this.tokenService.getUserDetails().role === "4") {
      this.filterCategory.type = "Call Center";
    } else if (this.tokenService.getUserDetails().role === "5") {
      this.filterCategory.type = "Procuiment";
    }

    console.log(this.filterCategory);
    this.fetchAllComplain(this.page, this.itemsPerPage);
    this.getAllComplainCategories();
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;

    this.complainSrv
      .getAllComplain(
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
          console.log(res.results);

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


  regStatusFil() {
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  searchComplain() {
    this.page = 1;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = "";
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  navigateSelectComplain(id: string, farmerName: string) {
    this.router.navigate([
      `/complaints/view-selected-complain/${id}/${farmerName}`,
    ]);
  }

  fetchComplain(id: any, farmerName: string, lastName: string, language: string) {
    this.isLoading = true;
    this.complainSrv.getComplainById(id).subscribe((res) => {
      let formattedDate = this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm a');
      if (formattedDate) {
        // Replace colon with dot and remove space before AM/PM
        res.createdAt = formattedDate.replace(':', '.').replace(' ', '').replace('AM', 'AM').replace('PM', 'PM');
      }
      this.complain = res;
      console.log(res);
      this.isLoading = false;
      // this.showReplyDialog(id, farmerName, language);
      this.showReplyPopUp(id, farmerName, lastName, language)
    });
  }


  showReplyDialog(id: any, farmerName: string, language: string) {
    this.selectedComplainId = id;
    this.selectedLanguage = language;
    this.selectedFarmerName = farmerName;
    this.selectedReply = this.complain.reply || '';
    this.showReplyModal = true;
  }

  sendReply() {
    this.messageContent = this.selectedReply;
    this.submitComplaint(this.selectedComplainId);
    this.closeModal();
  }

  closeModal() {
    this.showReplyModal = false;
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

    console.log(id);
    console.log(this.messageContent);

    const body = { reply: this.messageContent };

    this.http
      .put(`${environment.API_URL}auth/reply-complain/${id}`, body, { headers })
      .subscribe(
        (res: any) => {
          console.log("Market Price updated successfully", res);

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Market Price updated successfully!",
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

  navigationPath(path: string) {
    this.router.navigate([path]);
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
        .get<any>(`${environment.API_URL}auth/get-all-complain-category-list-super/1`, {
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
        .get<any>(`${environment.API_URL}auth/get-all-complain-category-list/${this.tokenService.getUserDetails().role}/1`, {
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

  goBack() {
    // Example: Navigate to the previous page, like a menu or dashboard
    this.router.navigate(['/complaints']);
  }

  showReplyPopUp(id: number, fname: string, lname: string, language: string) {
    this.selectedComplainId = id;
    this.selectedFarmerName = fname + ' ' + lname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }

  closeReplyPopUp() {
    this.isPopUpVisible = false;
    this.selectedFarmerName = 'English';
    this.selectedLanguage = '';
  }

}

// Define interfaces for response data
class Complain {
  id!: string;
  refNo!: string;
  complainCategory!: string;
  NIC!: string;
  farmerName!: string;
  lastName!: string;
  language!: string;
  complain!: string;
  status!: string;
  createdAt!: Date;
  reply!: string;
}

class Status {
  id!: number;
  type!: string;
}

class Category {
  id!: number;
  type!: string;
}

class ComplainIn {
  id!: string;
  refNo!: string;
  status!: string;
  firstName!: string;
  lastName!: string;
  farmerPhone!: string;
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
