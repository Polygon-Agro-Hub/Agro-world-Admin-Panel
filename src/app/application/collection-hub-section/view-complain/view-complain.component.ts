import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-view-complain',
  standalone: true,
  imports: [CommonModule, DropdownModule, NgxPaginationModule, FormsModule, LoadingSpinnerComponent],
  providers: [DatePipe], // Provide DatePipe for date formatting
  templateUrl: './view-complain.component.html',
  styleUrls: ['./view-complain.component.css']
})
export class ViewComplainComponent implements OnInit {
  statusFilter: any;
  hasData: boolean = true;
  complainsData!: Complain[];
  complain: ComplainIn = new ComplainIn();
  messageContent: string = '';
  @ViewChild('dropdown') dropdown!: Dropdown;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  filterStatus: any = '';
  filterCategory: any = {};
  status!: Status[];
  category!: Category[];

  searchText: string = '';
  isLoading = false;

  constructor(
    private complainSrv: CollectionCenterService,
    private datePipe: DatePipe,
    private router: Router,
    // private tokenService: TokenService,
    private http: HttpClient,
    public tokenService: TokenService

  ) { }

  ngOnInit(): void {
    console.log(this.tokenService.getUserDetails().role);

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

    if (this.tokenService.getUserDetails().role === '2') {
      this.filterCategory.type = 'Agriculture';
    } else if (this.tokenService.getUserDetails().role === '3') {
      this.filterCategory.type = 'Finance';
    } else if (this.tokenService.getUserDetails().role === '4') {
      this.filterCategory.type = 'Call Center';
    } else if (this.tokenService.getUserDetails().role === '5') {
      this.filterCategory.type = 'Procuiment';
    }

    console.log(this.filterCategory)
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.complainSrv.getAllComplain(page, limit, this.filterStatus?.type, this.filterCategory?.type, this.searchText).subscribe(
      (res) => {
        console.log(res.results);

        // Map response data to ensure createdAt is in a readable date format
        this.complainsData = res.results.map((item: any) => ({
          ...item,
          createdAt: this.datePipe.transform(item.createdAt, 'yyyy-MM-dd') // Convert date format
        }));
        this.totalItems = res.total;
        this.isLoading = false;
      },
      (error) => {
        console.log("Error: ", error);
        this.isLoading = false;
      }
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

  searchComplain() {
    this.page = 1;
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  clearSearch(): void {
    this.searchText = '';
    this.fetchAllComplain(this.page, this.itemsPerPage);
  }

  navigateSelectComplain(id: string, farmerName: string) {
    this.router.navigate([`/collection-hub/view-selected-complain/${id}/${farmerName}`])
  }


  fetchComplain(id: any, farmerName: string) {
    this.isLoading = true;
    this.complainSrv.getComplainById(id).subscribe((res) => {
      res.createdAt = this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm:ss a') || res.createdAt;
      this.complain = res;
      console.log(res);
      this.isLoading = false;
      this.showReplyDialog(id, farmerName);

    });
  }


  showReplyDialog(id: any, farmerName: string) {
    Swal.fire({
      title: 'Reply as AgroWorld',
      html: `
            <div class="text-left">
              <p>Dear <strong>${farmerName}</strong>,</p>
              <p>We are pleased to inform you that your complaint has been resolved.</p>
              <textarea 
                id="messageContent" 
                class="w-full p-2 border rounded mt-3 mb-3" 
                rows="5"
                placeholder="Add your message here..."
              >${this.complain.reply || ''}</textarea>
              <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
              <p class="mt-3">
                Sincerely,<br/>
                AgroWorld Customer Support Team
              </p>
            </div>
          `,
      showCancelButton: true,
      confirmButtonText: 'Send',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      width: '600px',
      preConfirm: () => {
        const textarea = document.getElementById('messageContent') as HTMLTextAreaElement;
        return textarea.value;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.messageContent = result.value;
        this.submitComplaint(id);
      }
    });
  }






  submitComplaint(id: any) {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });



    console.log(id);
    console.log(this.messageContent);

    const body = { reply: this.messageContent };

    this.http
      .put(
        `${environment.API_URL}auth/reply-complain/${id}`,
        body,
        { headers }
      )
      .subscribe(
        (res: any) => {
          console.log('Market Price updated successfully', res);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Market Price updated successfully!',
          });
          this.fetchAllComplain(this.page, this.itemsPerPage);

        },
        (error) => {
          console.error('Error updating news', error);

          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating news',
          });
          this.fetchAllComplain(this.page, this.itemsPerPage);
        }
      );
  }

  navigationPath(path: string) {
    this.router.navigate([path])
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
  complain!: string;
  status!: string;
  createdAt!: string;
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

