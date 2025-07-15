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
selectedLanguage: string = '';
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
  filterComCategory: any = {};
  status!: Status[];
  category!: Category[];
  

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
  ) {}

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

  fetchComplain(id: any, farmerName: string, language: string) {
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
      this.showReplyDialog(id, farmerName, language);
    });
  }

 




  // showReplyDialog(id: any, farmerName: string, language: string) {
  //   let closingMessage = '';
    
  //   if (language === 'Sinhala') {
  //     closingMessage = `
  //       <p>හිතවත් <strong>${farmerName}</strong>,</p>
  //       <p></p>
  //       <textarea 
  //         id="messageContent" 
  //         class="w-full p-2 border rounded mt-3 mb-3" 
  //         rows="5" 
  //         readonly
  //         placeholder="ඔබගේ පණිවුඩය මෙතැනට ඇතුලත් කරන්න..."
  //       >${this.complain.reply || ""}</textarea>
  //       <p>ඔබට තවත් ගැටළු හෝ ප්‍රශ්න තිබේ නම්, කරුණාකර අප හා සම්බන්ධ වන්න. ඔබේ ඉවසීම සහ අවබෝධය වෙනුවෙන් ස්තූතියි.</p>
  //       <p class="mt-3">
  //         මෙයට,<br/>
  //         AgroWorld පාරිභෝගික සහාය කණ්ඩායම
  //       </p>
  //     `;
  //   } else if (language === 'Tamil') {
  //     closingMessage = `
  //       <p>அன்புள்ள <strong>${farmerName}</strong>,</p>
  //       <p></p>
  //       <textarea 
  //         id="messageContent" 
  //         class="w-full p-2 border rounded mt-3 mb-3" 
  //         rows="5" 
  //         readonly
  //         placeholder="உங்கள் செய்தியை இங்கே சேர்க்கவும்..."
  //       >${this.complain.reply || ""}</textarea>
  //       <p>உங்களுக்கு மேலும் ஏதேனும் சிக்கல்கள் அல்லது கேள்விகள் இருந்தால், தயவுசெய்து எங்களைத் தொடர்பு கொள்ளவும். உங்கள் பொறுமைக்கும் புரிதலுக்கும் நன்றி.</p>
  //       <p class="mt-3">
  //         இதற்கு,<br/>
  //         அக்ரோவேர்ல்ட் வாடிக்கையாளர் ஆதரவு குழு
  //       </p>
  //     `;
  //   } else {
  //     // Default English
  //     closingMessage = `
  //       <p>Dear <strong>${farmerName}</strong>,</p>
  //       <p></p>
  //       <textarea 
  //         id="messageContent" 
  //         class="w-full p-2 border rounded mt-3 mb-3" 
  //         rows="5"
  //         readonly
  //         placeholder="Add your message here..."
  //       >${this.complain.reply || ""}</textarea>
  //       <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
  //       <p class="mt-3">
  //         Sincerely,<br/>
  //         AgroWorld Customer Support Team
  //       </p>
  //     `;
  //   }
  
  //   Swal.fire({
  //     title: "Reply as AgroWorld",
  //     html: `<div class="text-left">${closingMessage}</div>`,
  //     showCancelButton: true,
  //     showConfirmButton: false,
  //     confirmButtonText: "Send",
  //     cancelButtonText: "Cancel",
  //     confirmButtonColor: "#3980C0",
  //     cancelButtonColor: "#74788D",
  //     width: "600px",
  //     reverseButtons: true,
  //     preConfirm: () => {
  //       const textarea = document.getElementById("messageContent") as HTMLTextAreaElement;
  //       return textarea.value;
  //     },
  //     didOpen: () => {
  //       setTimeout(() => {
  //         const actionsElement = document.querySelector('.swal2-actions');
  //         if (actionsElement) {
  //           actionsElement.setAttribute(
  //             'style',
  //             'display: flex; justify-content: flex-end !important; width: 100%;'
  //           );
      
  //           const cancelButton = document.querySelector('.swal2-cancel') as HTMLElement;
  //           const confirmButton = document.querySelector('.swal2-confirm');
      
  //           if (cancelButton && confirmButton) {
  //             cancelButton.style.marginRight = '8px'; // <-- Add right margin here
  //             actionsElement.insertBefore(cancelButton, confirmButton);
  //           }
  //         }
  //       }, 0);
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.messageContent = result.value;
  //       this.submitComplaint(id);
  //     }
  //   });
  // }

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

    if(this.tokenService.getUserDetails().role === "1"){
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
    }else{
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
