import { Component, OnInit } from "@angular/core";
import { ComplaintsService } from "../../../services/complaints/complaints.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule, DatePipe } from "@angular/common";
import Swal from "sweetalert2";
import { Dialog, DialogModule } from "primeng/dialog";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextareaModule } from "primeng/inputtextarea";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environment/environment";
import { TokenService } from "../../../services/token/services/token.service";
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-view-selected-sales-dash-complain',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextareaModule,
    FormsModule,
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-selected-sales-dash-complain.component.html',
  styleUrl: './view-selected-sales-dash-complain.component.css',
  providers: [DatePipe],
})
export class ViewSelectedSalesDashComplainComponent implements OnInit {

  complain: Complain = new Complain();
  complainId!: string;
  firstName!: string;
  display: boolean = false; // Controls dialog visibility
  complaintText: string = ""; // Holds the text entered in the textarea
  messageContent: string = "";
  isLoading = false;
  isPopUpVisible: boolean = false;

  constructor(
    private complainSrv: ComplaintsService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  showDialog() {
    this.display = true; // Opens the dialog
  }

  hideDialog() {
    this.display = false; // Closes the dialog
  }

  fetchComplain() {
    this.isLoading = true;
    this.complainSrv.getComplainById(this.complainId).subscribe((res) => {
      res.createdAt =
        this.datePipe.transform(res.createdAt, "yyyy-MM-dd hh:mm:ss a") ||
        res.createdAt;
      this.complain = res;
      console.log('data', this.complain);
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params["id"];
    this.firstName = this.route.snapshot.params["firstName"];
    this.fetchComplain();
  }

  // submitComplaint() {
  //   console.log('Complaint Submitted:', this.complaintText);
  //   alert('Complaint Submitted: ' + this.complaintText);
  //   this.hideDialog(); // Close the dialog after submission
  // }

submitComplaint() {
  this.isLoading = true;
  const token = this.tokenService.getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  this.hideDialog();

  console.log(this.complainId);
  console.log(this.messageContent);
  if (this.complain.reply === null || this.complain.reply === undefined) {
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please write a reply before sending',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    this.isLoading = false;
    return;
  }

  const body = { reply: this.complain.reply };

  this.http
    .put(
      `${environment.API_URL}complain/reply-complain/${this.complainId}`,
      body,
      { headers },
    )
    .subscribe(
      (res: any) => {
        console.log("Sales Dash updated successfully", res);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Reply was sent successfully!",
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });

        this.fetchComplain();
        this.isLoading = false;
        this.router.navigate(['/complaints/view-sales-dash-complain']);
      },
      (error) => {
        console.error("Error updating news", error);

        Swal.fire({
          icon: "error",
          title: "Unsuccessful",
          text: "Error sending reply",
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });

        this.fetchComplain();
        this.isLoading = false;
      },
    );
}





  // showReplyDialog() {
  //   Swal.fire({
  //     title: "Reply as Polygon",
  //     html: `
  //         <div class="text-left">
  //           <p>Dear <strong>${this.firstName}</strong>,</p>
  //           <p></p>
  //           <textarea 
  //             id="messageContent" 
  //             class="w-full p-2 border rounded mt-3 mb-3" 
  //             rows="5" 
  //             placeholder="Add your message here..."
  //           >${this.complain.reply || ""}</textarea>
  //           <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
  //           <p class="mt-3">
  //             Sincerely,<br/>
  //             AgroWorld Customer Support Team
  //           </p>
  //         </div>
  //       `,
  //     showCancelButton: true,
  //     confirmButtonText: "Send",
  //     cancelButtonText: "Cancel",
  //     confirmButtonColor: "#3980C0", // Green color for Send button
  //     cancelButtonColor: "#74788D", // Blue-gray for Cancel button
  //     width: "600px",
  //     reverseButtons: true, // Swap button positions
  //     preConfirm: () => {
  //       const textarea = document.getElementById("messageContent") as HTMLTextAreaElement;
  //       return textarea.value;
  //     },
  //     didOpen: () => {
  //       // Direct DOM manipulation for button alignment
  //       setTimeout(() => {
  //         const actionsElement = document.querySelector('.swal2-actions');
  //         if (actionsElement) {
  //           actionsElement.setAttribute('style', 'display: flex; justify-content: flex-end !important; width: 100%;');

  //           // Also swap buttons if needed (in addition to reverseButtons)
  //           const cancelButton = document.querySelector('.swal2-cancel');
  //           const confirmButton = document.querySelector('.swal2-confirm');
  //           if (cancelButton && confirmButton && actionsElement) {
  //             actionsElement.insertBefore(cancelButton, confirmButton);
  //           }
  //         }
  //       },); // Small delay to ensure DOM is ready
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.messageContent = result.value;
  //       this.submitComplaint();
  //     }
  //   });
  // }

  showReplyPopUp() {
    this.isPopUpVisible = true;
  }

  closeReplyPopUp() {
    this.isPopUpVisible = false;
  }




}

class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  firstName!: string;
  lastName!: string;
  phoneNumber1!: string;
  phoneCode1!: string;
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
