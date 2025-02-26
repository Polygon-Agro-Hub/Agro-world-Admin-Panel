import { Component, OnInit, NgModule  } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { BrowserModule, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { CalendarModule } from 'primeng/calendar';

import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NewsService } from '../../../services/plant-care/news.service';
import { TokenService } from '../../../services/token/services/token.service';


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
    CalendarModule
  ],
  providers: [DatePipe],
  templateUrl: './manage-content.component.html',
  styleUrl: './manage-content.component.css',
  template: `
    <pagination-controls
      (pageChange)="onPageChange($event)"
      [totalItems]="totalItems"
      [itemsPerPage]="20"
    >
    </pagination-controls>
  `,
})
export class ManageContentComponent implements OnInit {
  newsItems: NewsItem[] = [];
  selectedItem: any = null;
  isPopupVisible = false;
  page:number = 1;
  totalItems: number = 0;
  itemsPerPage:number = 10;
  isLoading = true;
  status: Status[] | undefined;
  selectedStatus: Status | undefined;
  statusFilter: any = '';
  createdDateFilter: string = '';
  hasData: boolean = true;  

  safeHtmlDescriptionEnglish: SafeHtml = '';
  safeHtmlDescriptionSinhala: SafeHtml = '';
  safeHtmlDescriptionTamil: SafeHtml = '';


  constructor(private newsService: NewsService, private http: HttpClient, private router: Router, private sanitizer: DomSanitizer, private tokenService: TokenService,) {}

  ngOnInit() {
    const token = this.tokenService.getToken();
  console.log('Token:', token);
    this.fetchAllNews(this.page, this.itemsPerPage);
    this.status = [
      { name: 'Published', code: 'Published' },
      { name: 'Draft', code: 'Draft' }
  ];
  }


  fetchAllNews(page: number = 1, limit: number = this.itemsPerPage) {
    this.page = page;
    this.newsService.fetchAllNews(page, limit, this.statusFilter?.code, this.createdDateFilter)
      .subscribe(
        (response:any) => {
          this.newsItems = response.items;
          this.totalItems = response.total;
          this.isLoading = false;
          if(response.length > 0){
            this.hasData = false
          }
        },
        (error) => {
          console.error('Error fetching news:', error);
          this.isLoading = false;
          // Handle error...
        }
      );
  }


  deleteNews(id: any) {
    const token =  this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.newsService.deleteNews(id)
          .subscribe(
            (data: any) => {
              console.log('News deleted successfully');
              Swal.fire(
                'Deleted!',
                'The news item has been deleted.',
                'success'
              );
              this.fetchAllNews();
              this.isLoading = false;
            },
            (error) => {
              console.error('Error deleting news:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the news item.',
                'error'
              );
              this.isLoading = false;
            }
          );
      }
    });
  }

  editNews(id: number) {
    this.isLoading = true;
    this.router.navigate(['/plant-care/action/create-news'], { queryParams: { id } }).then(()=> {
      this.isLoading = false;
    });
  }

  openPopup(id: any) {
    this.isPopupVisible = true;
    this.isLoading =true;

    this.newsService.getNewsById(id)
      .subscribe(
        (data) => {
          this.newsItems = data;
          console.log(this.newsItems);

          this.safeHtmlDescriptionEnglish = this.sanitizer.bypassSecurityTrustHtml(
            this.newsItems[0].descriptionEnglish
          );
          this.safeHtmlDescriptionSinhala = this.sanitizer.bypassSecurityTrustHtml(
            this.newsItems[0].descriptionSinhala
          );
          this.safeHtmlDescriptionTamil = this.sanitizer.bypassSecurityTrustHtml(
            this.newsItems[0].descriptionTamil
          );
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching news:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
          this.isLoading = false;
        }
      );
  }

  closePopup() {
    this.isPopupVisible = false;
    this.fetchAllNews();
  }

  updateStatus(id: any) {
         this.isLoading = true;
         this.newsService.updateNewsStatus(id)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          console.log('News updated successfully');
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Status updated successfully!',
          });
          this.isLoading = true;
          this.fetchAllNews();
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Error updating news', error);
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error updating status',
          });
        }
      );
  }
  onPageChange(event: number){
    this.page = event;
    this.fetchAllNews(this.page, this.itemsPerPage);
  }

  applyFilters() {
    this.fetchAllNews(1, this.itemsPerPage);
  }

  back(): void {
    this.router.navigate(['/plant-care/action']);
  }



}
