import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { StakeholderService } from '../../../services/stakeholder/stakeholder.service';
import Swal from 'sweetalert2';

interface ShopData {
  id: number;
  shopName: string;
  email: string;
  createdAt: string;
  shopPhone: string;
  brImg: string;
  adress: string;
  latitude: string;
  longitude: string;
  ownername: string;
  nic: string;
  currentPlan: string;
  planPrice?: string;
  expireDate?: string;
  planStatus?: string;
}

@Component({
  selector: 'app-view-govi-shop-suppliers',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DatePipe],
  templateUrl: './view-govi-shop-suppliers.component.html',
  styleUrl: './view-govi-shop-suppliers.component.css',
})
export class ViewGoviShopSuppliersComponent implements OnInit {
  isLoading = false;
  shopData: ShopData | null = null;
  defaultImage = 'assets/images/defaultImg.png';
  shopId: number | null = null;

  // Image Modal Properties
  isModalOpen = false;
  modalImage = '';
  modalTitle = '';
  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  // Map Modal Properties
  showMapPopup = false;
  mapUrl: SafeResourceUrl = '';
  mapIframeLoaded = false;
  hasCoordinates = false;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private stakeholderService: StakeholderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.shopId = +params['id'];
        if (this.shopId) {
          this.loadShopData(this.shopId);
        }
      } else {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state) {
          const supplier = navigation.extras.state['supplier'];
          if (supplier && supplier.id) {
            this.shopId = supplier.id;
            if (this.shopId) {
              this.loadShopData(this.shopId);
            }
          } else {
            this.showError('No shop ID provided');
            this.back();
          }
        } else {
          this.showError('No shop ID provided');
          this.back();
        }
      }
    });
  }

  loadShopData(id: number): void {
    this.isLoading = true;
    this.stakeholderService.viewGoviShopSupplierById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.shopData = response.data;
        } else {
          this.showError('Failed to load shop data');
          this.back();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading shop data:', error);
        this.showError('Failed to load shop data');
        this.back();
      }
    });
  }

  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
  }

  back(): void {
    this.location.back();
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  // Image Modal Methods
  openImageModal(imageUrl: string, title: string): void {
    if (!imageUrl) {
      imageUrl = this.defaultImage;
    }
    this.modalImage = imageUrl;
    this.modalTitle = title;
    this.isModalOpen = true;
    this.resetImageTransform();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetImageTransform();
  }

  resetImageTransform(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
  }

  zoomIn(): void {
    if (this.scale < 3) {
      this.scale += 0.25;
    }
  }

  zoomOut(): void {
    if (this.scale > 1) {
      this.scale -= 0.25;
      if (this.scale === 1) {
        this.translateX = 0;
        this.translateY = 0;
      }
    }
  }

  getImageTransform(): string {
    return `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
  }

  onMouseDown(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  onMouseLeave(): void {
    this.isPanning = false;
  }

  // Map Modal Methods
  openMapModal(): void {
    if (this.shopData?.latitude && this.shopData?.longitude) {
      this.hasCoordinates = true;
      const lat = parseFloat(this.shopData.latitude);
      const lon = parseFloat(this.shopData.longitude);

      // OpenStreetMap embed URL
      const mapUrlString = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrlString);
      this.mapIframeLoaded = false;
    } else {
      this.hasCoordinates = false;
    }

    this.showMapPopup = true;
  }

  closePopup(): void {
    this.showMapPopup = false;
    this.mapIframeLoaded = false;
  }
}
