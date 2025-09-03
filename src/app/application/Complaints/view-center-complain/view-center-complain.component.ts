import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-view-center-complain',
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
  templateUrl: './view-center-complain.component.html',
  styleUrl: './view-center-complain.component.css',
  providers: [DatePipe], // Add DatePipe to providers
})
export class ViewCenterComplainComponent {
  complain: Complain = new Complain();
  complainId!: string;
  farmerName!: string;
  display: boolean = false; // Controls dialog visibility
  complaintText: string = ""; // Holds the text entered in the textarea
  messageContent: string = "";
  isLoading = false;

  isPopUpVisible: boolean = false;
  selectedLanguage: string = 'English';
  selectedOfficerName: string = '';

  constructor(
    private complainSrv: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }


  ngOnInit(): void {
    this.complainId = this.route.snapshot.params["id"];

    this.fetchComplain();
  }

  back(): void {
    this.router.navigate(['complaints/collection-center-complains']);
  }


  fetchComplain() {
    this.isLoading = true;
    this.complainSrv.getCenterComplainById(this.complainId).subscribe((res) => {
      res.createdAt =
        this.datePipe.transform(res.createdAt, "yyyy-MM-dd hh:mm:ss a") ||
        res.createdAt;
      this.complain = res;
      console.log(res);
      this.isLoading = false;
    });
  }




  showReplyDialog() {
    Swal.fire({
      title: "Reply as AgroWorld",
      html: `
        <div class="text-left">
          <p>Dear <strong>${this.complain.firstName}</strong>,</p>
          <p></p>
          <textarea 
            id="messageContent" 
            class="w-full p-2 border rounded mt-3 mb-3" 
            rows="5" 
            placeholder="Add your message here..."
          >${this.complain.reply || ""}</textarea>
          <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
          <p class="mt-3">
            Sincerely,<br/>
            AgroWorld Customer Support Team
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Send",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3980C0", // Green color for Send button
      cancelButtonColor: "#74788D", // Blue-gray for Cancel button
      width: "600px",
      reverseButtons: true, // Swap button positions
      preConfirm: () => {
        const textarea = document.getElementById("messageContent") as HTMLTextAreaElement;
        return textarea.value;
      },
      didOpen: () => {
        // Direct DOM manipulation for button alignment
        setTimeout(() => {
          const actionsElement = document.querySelector('.swal2-actions');
          if (actionsElement) {
            actionsElement.setAttribute('style', 'display: flex; justify-content: flex-end !important; width: 100%;');

            // Also swap buttons if needed (in addition to reverseButtons)
            const cancelButton = document.querySelector('.swal2-cancel');
            const confirmButton = document.querySelector('.swal2-confirm');
            if (cancelButton && confirmButton && actionsElement) {
              actionsElement.insertBefore(cancelButton, confirmButton);
            }
          }
        },); // Small delay to ensure DOM is ready
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.messageContent = result.value;
        this.submitComplaint();
      }
    });
  }

  submitComplaint() {
    this.isLoading = true;
    const token = this.tokenService.getToken();
    if (!token) {
      console.error("No token found");
      return;
    }

    if(this.complain.reply === '' || this.complain.reply === null || this.complain.reply === undefined) {
      Swal.fire({ 
        icon: "warning",
        title: "Warning",
        text: "Reply cannot be empty!",
      });
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = { reply: this.complain.reply };

    this.http
      .put(
        `${environment.API_URL}auth/reply-center-complain/${this.complainId}`,
        body,
        { headers },
      )
      .subscribe(
        (res: any) => {
          console.log("Reply Sent successfully", res);

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Reply Sent successfully!",
          }).then((result) => {
            // This code executes when the user clicks OK
            if (result.isConfirmed) {
              // Redirect to the complaints page
              this.router.navigate(['/complaints/collection-center-complains']);
            }
            this.fetchComplain();
            this.isLoading = false;
            this.isPopUpVisible = false;
          });
        },
        (error) => {
          console.error("Error updating news", error);

          Swal.fire({
            icon: "error",
            title: "Unsuccessful",
            text: "Error updating news",
          });
          this.fetchComplain();
          this.isLoading = false;
        },
      );
  }


  showDialog() {
    this.display = true; // Opens the dialog
  }

  hideDialog() {
    this.display = false; // Closes the dialog
  }

  showReplyPopUp(fname: string, language: string) {
    this.selectedOfficerName = fname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }


  closeReplyPopUp() {
    this.isPopUpVisible = false;
    this.selectedOfficerName = 'English';
    this.selectedLanguage = '';

  }
}



class Complain {
  id!: string;
  empId!: any;
  jobRole!: string;
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
  officerNameSinhala!:string;
  officerNameTamil!:string;
}