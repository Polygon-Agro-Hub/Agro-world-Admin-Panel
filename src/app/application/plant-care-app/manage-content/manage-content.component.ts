import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import {
  BrowserModule,
  DomSanitizer,
  SafeHtml,
} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NewsService } from '../../../services/plant-care/news.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface NewsItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  status: string;
  image: string;
  publishDate: string;
  expireDate: string;
  createdAt: string;
}

interface Status {
  name: string;
  code: any;
}

@Component({
  selector: 'app-manage-content',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
  ],
  providers: [DatePipe],
  templateUrl: './manage-content.component.html',
  styleUrl: './manage-content.component.css',
  template: `
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="20"
    ></pagination-controls>
  `,
})
export class ManageContentComponent implements OnInit {
  newsItems: NewsItem[] = [];
  selectedItem: any = null;
  isPopupVisible = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  isLoading = true;
  status: Status[] | undefined;
  selectedStatus: Status | undefined;
  statusFilter: any = '';
  createdDateFilter: string = '';
  hasData: boolean = false;

  safeHtmlDescriptionEnglish: SafeHtml = '';
  safeHtmlDescriptionSinhala: SafeHtml = '';
  safeHtmlDescriptionTamil: SafeHtml = '';

  selectedNewsItem: NewsItem | null = null;

  constructor(
    private newsService: NewsService,
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.fetchAllNews(this.page, this.itemsPerPage);
    this.status = [
      { name: 'Published', code: 'Published' },
      { name: 'Draft', code: 'Draft' },
    ];
  }

  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;
    
    // First convert the string to a Date object if it exists
    let dateObj = this.createdDateFilter ? new Date(this.createdDateFilter) : undefined;
    
    // Then format it (using Solution 1 approach - date only)
    let formattedDate = dateObj 
        ? this.formatLocalDate(dateObj) 
        : undefined;

    console.log("createdDateFilter", this.createdDateFilter);
    console.log('Formatted Date:', formattedDate);
    
    this.newsService
      .fetchAllNews(
        page,
        limit,
        this.statusFilter?.code,
        formattedDate
      )
      .subscribe(
        (response: any) => {
          this.newsItems = response.items;
          this.totalItems = response.total;
          this.isLoading = false;
          this.hasData = response.total > 0;
        },
        (error) => {
          this.isLoading = false;
        }
      );
}

// Helper function to format date as YYYY-MM-DD
private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

  deleteNews(id: any) {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this news item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.newsService.deleteNews(id).subscribe(
          (data: any) => {
            Swal.fire('Deleted!', 'The news item has been deleted.', 'success');
            this.fetchAllNews();
            this.isLoading = false;
          },
          (error) => {
            Swal.fire({
              title: 'Error!',
              text: 'There was an error deleting the news item.',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              }
            });
            this.isLoading = false;
          }
        );
      }
    });
  }

  editNews(id: number) {
    this.isLoading = true;
    this.router
      .navigate(['/plant-care/action/create-news'], { queryParams: { id } })
      .then(() => {
        this.isLoading = false;
      });
  }

  // Update the openPopup method with proper typing
openPopup(id: any) {
  this.isPopupVisible = true;
  this.isLoading = true;
  this.newsService.getNewsById(id).subscribe(
    (data: NewsItem[]) => {
      // Store the single news item in selectedNewsItem
      this.selectedNewsItem = data[0];
      
      // Add null checks before accessing properties
      if (this.selectedNewsItem) {
        this.safeHtmlDescriptionEnglish =
          this.sanitizer.bypassSecurityTrustHtml(
            this.selectedNewsItem.descriptionEnglish
          );
        this.safeHtmlDescriptionSinhala =
          this.sanitizer.bypassSecurityTrustHtml(
            this.selectedNewsItem.descriptionSinhala
          );
        this.safeHtmlDescriptionTamil = this.sanitizer.bypassSecurityTrustHtml(
          this.selectedNewsItem.descriptionTamil
        );
      }
      
      this.isLoading = false;
    },
    (error) => {
      this.isLoading = false;
    }
  );
}

  closePopup() {
  this.isPopupVisible = false;
  this.selectedNewsItem = null; // Clear the selected item
}
  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
        this.router.navigate(['/plant-care/action']);
    }
  });
}


  updateStatus(id: any, currentStatus: string) {
  // Determine the message and button text based on current status
  const isDraft = currentStatus === 'Draft';
  const message = isDraft 
    ? 'Do you want to publish?' 
    : 'Do you want to move back to draft?';
  const confirmButtonText = isDraft ? 'Publish' : 'Draft';

  // Show confirmation dialog
  Swal.fire({
    title: 'Confirm Status Change',
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // User confirmed, proceed with status update
      this.isLoading = true;
      this.newsService.updateNewsStatus(id).subscribe(
        (data: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Status updated successfully!',
          });
          this.fetchAllNews();
          this.isLoading = false;
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error updating status',
          });
          this.isLoading = false;
        }
      );
    }
  });
}

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllNews(1, this.itemsPerPage);
  }





  onDateClear(){
    this.createdDateFilter = '';
    this.fetchAllNews(1, this.itemsPerPage);

  }
}
