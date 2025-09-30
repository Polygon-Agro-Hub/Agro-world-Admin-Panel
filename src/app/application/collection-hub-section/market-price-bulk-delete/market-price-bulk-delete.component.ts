import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';

interface marketxl {
  id: number;
  xlName: string;
  createdAt: any;
  startTime: any;
  endTime: any;
}

@Component({
  selector: 'app-market-price-bulk-delete',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, NgxPaginationModule],
  templateUrl: './market-price-bulk-delete.component.html',
  styleUrl: './market-price-bulk-delete.component.css',
})
export class MarketPriceBulkDeleteComponent {
  isLoading = false;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  mprices: marketxl[] = [];
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) { }

  ngOnInit() {
    this.fetchAllXl(this.page, this.itemsPerPage);
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllXl(this.page, this.itemsPerPage);
  }

  fetchAllXl(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.page = page;

    const token = `Bearer ${this.token}`;
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    this.http
      .get<{
        items: marketxl[];
        total: number;
      }>(
        `${environment.API_URL}market-price/get-all-market-xlsx?page=${page}&limit=${limit}`,
        { headers }
      )
      .subscribe(
        (response) => {
          this.mprices = response.items;
          this.hasData = this.mprices.length > 0;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  deleteAdminUser(id: any) {
    const token = `Bearer ${this.token}`;
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this market prices? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
        });

        this.http
          .delete(`${environment.API_URL}market-price/delete-xl-file/${id}`, {
            headers,
          })
          .subscribe(
            () => {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Sucessfully deleted the uploaded market prices',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
              this.fetchAllXl();
            },
            () => {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'There was an error deleting the news item.',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
            }
          );
      }
    });
  }

  back(): void {
    this.router.navigate(['/collection-hub']);
  }
}
