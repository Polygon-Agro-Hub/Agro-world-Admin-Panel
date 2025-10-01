import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-viewcompanylist',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  templateUrl: './viewcompanylist.component.html',
  styleUrl: './viewcompanylist.component.css'
})
export class ViewcompanylistComponent implements OnInit {
  isLoading = false;
  search: string = '';
  companies: CompanyDetails[] = [];
  total: number | null = null;
  hasData = false;

  constructor(private router: Router, private goviLinkService: GoviLinkService) { }

  back(): void {
    this.router.navigate(['/govi-link/action']);
  }

  add(): void {
    this.router
      .navigate(['/govi-link/action/add-a-company'])
      .then(() => {
        this.isLoading = false;
      });
  }

  searchPlantCareUsers() {
    console.log('Search triggered:', this.search);
    this.fetchAllCompanys();
  }

  fetchAllCompanys() {
    this.isLoading = true;
    this.goviLinkService.getAllCompanyDetails(this.search.trim())
      .subscribe(
        (response: any) => {
          console.log('API Response:', response);
          this.isLoading = false;
          this.companies = response.results || [];
          this.total = response.total || 0;
          this.hasData = this.companies.length > 0;
        },
        (error) => {
          console.error('API Error:', error);
          this.isLoading = false;
          this.hasData = false;
        }
      );
  }

  ngOnInit() {
    this.fetchAllCompanys(); // Initial fetch
  }

  clearSearch(): void {
    this.search = '';
    this.fetchAllCompanys();
  }

  openImageInNewTab(imageUrl: string): void {
    if (imageUrl.startsWith('data:')) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Image Preview</title></head>
            <body style="margin:0">
              <img src="${imageUrl}" style="width:100%; height:100%" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Popup Blocked',
          text: 'Please allow popups for this site to view the image.',
        });
      }
    } else if (imageUrl.startsWith('http')) {
      window.open(imageUrl, '_blank');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Image URL',
        text: 'Image URL is not valid. Cannot open in new tab.',
      });
    }
  }

  editCompany(id: number) {
    this.router.navigate(['/govi-link/action/edit-company'], {
      queryParams: { id }
    });
  }

}

class CompanyDetails {
  id!: number;
  RegNumber!: string;
  companyName!: string;
  accHolderName!: string;
  accName!: string;
  email!: string;
  financeOfficerName!: string;
  accNumber!: string;
  confirmAccNumber!: string;
  bank!: string;
  branch!: string;
  phoneCode1!: string;
  phoneNumber1!: string;
  phoneCode2!: string;
  phoneNumber2!: string;
  logo!: string;
  logoFile?: File;
  modifyBy!: string;
  createdAt!: string;
  modifierName!: string;
}
