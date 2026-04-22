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
  display: boolean = false;
  complaintText: string = "";
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
    this.display = true;
  }

  hideDialog() {
    this.display = false;
  }

  fetchComplain() {
    this.isLoading = true;
    this.complainSrv.getComplainById(this.complainId).subscribe((res) => {
      res.createdAt =
        this.datePipe.transform(res.createdAt, "yyyy-MM-dd hh:mm:ss a") ||
        res.createdAt;
      this.complain = res;
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params["id"];
    this.firstName = this.route.snapshot.params["firstName"];
    this.fetchComplain();
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
  if (this.complain.reply === null || this.complain.reply === undefined) {
  Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Reply field is required!',
      customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
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
