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

  constructor(
    private complainSrv: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}


  ngOnInit(): void {
    this.complainId = this.route.snapshot.params["id"];
    
    this.fetchComplain();
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
              <p>We are pleased to inform you that your complaint has been resolved.</p>
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
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        width: "600px",
        preConfirm: () => {
          const textarea = document.getElementById(
            "messageContent",
          ) as HTMLTextAreaElement;
          return textarea.value;
        },
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

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.hideDialog();

    console.log(this.complainId);
    console.log(this.messageContent);

    const body = { reply: this.messageContent };

    this.http
      .put(
        `${environment.API_URL}auth/reply-center-complain/${this.complainId}`,
        body,
        { headers },
      )
      .subscribe(
        (res: any) => {
          console.log("Market Price updated successfully", res);

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Market Price updated successfully!",
          });
          this.fetchComplain();
          this.isLoading = false;
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
}



class Complain {
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