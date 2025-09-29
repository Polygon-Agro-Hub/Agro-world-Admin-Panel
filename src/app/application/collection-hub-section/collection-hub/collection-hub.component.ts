import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-collection-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection-hub.component.html',
  styleUrl: './collection-hub.component.css',
})
export class CollectionHubComponent {
  popupVisibleCollectionCenter = false;
  popupVisibleComplains = false;
  popupVisibleMarketPrice = false;
  popupVisibleCompanys = false;
  popupVisibleAG = false;
  private token = this.tokenService.getToken();
  isDownloading = false;

  constructor(
    private http: HttpClient,
    public tokenService: TokenService,
    private router: Router,
    public permissionService: PermissionService
  ) { }

  togglePopupCollectionCenter() {
    this.popupVisibleCollectionCenter = !this.popupVisibleCollectionCenter;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCompanys = false;
    this.popupVisibleAG = false;
    if ((this.popupVisibleComplains = true)) {
      this.popupVisibleComplains = !this.popupVisibleComplains;
    }
  }

  togglePopupCompanys() {
    this.popupVisibleCompanys = !this.popupVisibleCompanys;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCollectionCenter = false;
    this.popupVisibleAG = false;
  }

  togglePopupComplains() {
    this.popupVisibleComplains = !this.popupVisibleComplains;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCompanys = false;
    this.popupVisibleAG = false;
    if ((this.popupVisibleCollectionCenter = true)) {
      this.popupVisibleCollectionCenter = !this.popupVisibleCollectionCenter;
    }
  }

  togglePopupMarketPrice() {
    this.popupVisibleMarketPrice = !this.popupVisibleMarketPrice;
    this.popupVisibleCompanys = false;
    this.popupVisibleComplains = false;
    this.popupVisibleCollectionCenter = false;
    this.popupVisibleAG = false;
  }

  togglePopupAG() {
    this.popupVisibleAG = !this.popupVisibleAG;
    this.popupVisibleCollectionCenter = false;
    this.popupVisibleMarketPrice = false;
    this.popupVisibleCompanys = false;
  }

  downloadTemplate1() {
    this.isDownloading = true;
    const apiUrl = `${environment.API_URL}market-price/download-crop-data`;

    fetch(apiUrl, {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error('Failed to download the file');
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Market Price Template.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        Swal.fire({
          icon: 'success',
          title: 'Downloaded',
          text: 'Please check your downloads folder',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        this.isDownloading = false;
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: error.message,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        this.isDownloading = false;
      });
  }

  viewPrice(): void {
    this.router.navigate(['/market-place/view-current-price']);
  }

  addPrice(): void {
    this.router.navigate(['/market-place/price-bulk-upload']);
  }

  deletePrice(): void {
    this.router.navigate(['/market-place/delete-bulk-price']);
  }

  addCom(): void {
    this.router.navigate(['/collection-hub/create-company']);
  }

  viewCom(): void {
    this.router.navigate(['/collection-hub/manage-company']);
  }

  viewCenter(): void {
    this.router.navigate(['/collection-hub/view-collection-centers']);
  }

  viewAgroworldCenters(): void {
    this.router.navigate(['/collection-hub/agro-world-centers']);
  }

  addCenter(): void {
    this.router.navigate(['/collection-hub/add-collection-center']);
  }
}
