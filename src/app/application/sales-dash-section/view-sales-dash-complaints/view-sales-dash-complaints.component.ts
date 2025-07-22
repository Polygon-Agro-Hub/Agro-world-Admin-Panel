import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-sales-dash-complaints',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  providers: [DatePipe],
  templateUrl: './view-sales-dash-complaints.component.html',
  styleUrl: './view-sales-dash-complaints.component.css',
})
export class ViewSalesDashComplaintsComponent implements OnInit {
  statusFilter: any;
  hasData: boolean = false;
  complainsData!: Complain[];
  complain: ComplainIn = new ComplainIn();
  messageContent: string = '';
  @ViewChild('dropdown') dropdown!: Dropdown;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  filterStatus: any = '';
  filterCategory: any = {};
  filterComCategory: any = '';
  status!: Status[];
  category!: Category[];
  replyStatus!: any[];
  rpst: string = '';
  isPopUpVisible: boolean = false;

  searchText: string = '';
  isLoading = false;
  comCategories: ComCategories[] = [];

  constructor(
    private complainSrv: ComplaintsService,
    private datePipe: DatePipe,
    private router: Router,
    // private tokenService: TokenService,
    private http: HttpClient,
    public tokenService: TokenService
  ) { }

  ngOnInit(): void {
    console.log('user role', this.tokenService.getUserDetails().role);

    this.status = [
      { id: 1, type: 'Assigned' },
      { id: 2, type: 'Pending' },
      { id: 3, type: 'Closed' },
    ];

    this.category = [
      { id: 1, type: 'Agriculture' },
      { id: 2, type: 'Finance' },
      { id: 3, type: 'Call Center' },
      { id: 4, type: 'Procuiment' },
    ];

    this.replyStatus = [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
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

    console.log(this.filterCategory);
    this.fetchAllComplain(this.page, this.itemsPerPage);
    this.getAllComplainCategories();
  }

  fetchAllComplain(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    console.log(
      'sending to backend',
      this.filterStatus,
      this.filterCategory,
      this.filterComCategory,
      this.searchText,
      page,
      limit
    );

    this.complainSrv
      .getAllSalesComplain(
        page,
        limit,
        this.filterStatus?.type,
        this.filterCategory?.type,
        this.rpst,
        this.filterComCategory?.id,
        this.searchText
      )
      .subscribe(
        (res) => {
          console.log(res.results);

          // Map response data to ensure createdAt is in a readable date format
          this.complainsData = res.results
          // .map((item: any) => ({
          //   ...item,
          //   createdAt: this.datePipe.transform(item.createdAt, 'yyyy-MM-dd'), // Convert date format
          // }));
          this.totalItems = res.total;
          this.hasData = res.total === 0 ? false : true;
          this.isLoading = false;
        },
        (error) => {
          console.log('Error: ', error);
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

  navigationPath(path: string) {
    this.router.navigate([path]);
  }

  getAllComplainCategories() {
    if (this.tokenService.getUserDetails().role === '1') {
      const token = this.tokenService.getToken();

      if (!token) {
        console.error('No token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .get<any>(
          `${environment.API_URL}auth/get-all-complain-category-list-super/4`,
          {
            headers,
          }
        )
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
        .get<any>(
          `${environment.API_URL}auth/get-all-complain-category-list/${this.tokenService.getUserDetails().role
          }/4`,
          {
            headers,
          }
        )
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

  navigateSelectComplain(id: string, firstName: string) {
    console.log('opening');
    this.router.navigate([
      `/complaints/view-selected-sales-dash-complain/${id}/${firstName}`,
    ]);
  }

  fetchComplain(id: any, firstName: string) {
    console.log('haa', id, firstName);
    this.isLoading = true;
    this.complainSrv.getComplainById(id).subscribe((res) => {
      let formattedDate = this.datePipe.transform(
        res.createdAt,
        'yyyy-MM-dd hh:mm a'
      );
      if (formattedDate) {
        // Replace colon with dot and remove space before AM/PM
        res.createdAt = formattedDate
          .replace(':', '.')
          .replace(' ', '')
          .replace('AM', 'AM')
          .replace('PM', 'PM');
      }
      this.complain = res;
      console.log(res);
      this.isLoading = false;
      // this.showReplyDialog(id, firstName);
      this.isPopUpVisible = true;

    });
  }

  showReplyDialog(id: any, firstName: string) {
    Swal.fire({
      title: 'Reply as Polygon',
      html: `
      <div class="text-left">
        <p>Dear <strong>${firstName}</strong>,</p>
        <p></p>
        <textarea 
          id="messageContent" 
          class="w-full p-2 border rounded mt-3 mb-3" 
          rows="5" 
          placeholder="Add your message here..."
          disabled 
        >${this.complain.reply || ''}</textarea>
        <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
        <p class="mt-3">
          Sincerely,<br/>
          AgroWorld Customer Support Team
        </p>
      </div>
    `,
      showCancelButton: true,
      showConfirmButton: false, // Hide the Send button
      cancelButtonText: 'Close',
      cancelButtonColor: '#74788D',
      width: '600px',
      didOpen: () => {
        setTimeout(() => {
          const actionsElement = document.querySelector('.swal2-actions');
          if (actionsElement) {
            // Align the Close button to the right
            actionsElement.setAttribute(
              'style',
              'display: flex; justify-content: flex-end !important; width: 100%; padding: 0.5em;'
            );
          }
        });
      },
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
      .put(`${environment.API_URL}complain/reply-complain/${id}`, body, {
        headers,
      })
      .subscribe(
        (res: any) => {
          console.log('Sales Dash updated successfully', res);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Sales Dash updated successfully!',
          });
          this.fetchAllComplain(this.page, this.itemsPerPage);
        },
        (error) => {
          console.error('Error updating news', error);

          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating Sales Dash',
          });
          this.fetchAllComplain(this.page, this.itemsPerPage);
        }
      );
  }

  regStatusFil(): void {
    console.log('replyStatus', this.rpst)
    this.applyFilters();
  }

  closeDialog() {
    this.isPopUpVisible = false;
    this.complain = new ComplainIn();
  }
}

class Complain {
  id!: string;
  refNo!: string;
  complainCategory!: string;
  agentId!: string;
  firstName!: string;
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
  AgentPhone!: string;
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
