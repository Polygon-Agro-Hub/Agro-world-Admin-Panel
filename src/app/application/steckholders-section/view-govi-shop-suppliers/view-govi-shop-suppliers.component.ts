import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';

interface ShopData {
  id: number;
  shopName: string;
  email: string;
  joinedDate: string;
  phoneNumber: string;
  brImage: string;
  address: string;
  latitude: number;
  longitude: number;
  ownerName: string;
  ownerNIC: string;
  ownerPhoneNumber: string;
  image: string;
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
  ) {}

  ngOnInit(): void {
    this.loadShopData();
  }

  loadShopData(): void {
    this.shopData = {
      id: 1,
      shopName: 'Agri Shop',
      email: 'agri@gmail.com',
      joinedDate: '2026-06-03',
      phoneNumber: '0113333800',
      brImage:
        'https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/inspection/idproof/74fb4d0b-1a47-42b3-b790-d7d6dceca521.jpg',
      address: '1/A, Galle Road, Dehiwala',
      latitude: 7.2008,
      longitude: 79.8358,
      ownerName: 'Gayani Perera',
      ownerNIC: '918700050V',
      ownerPhoneNumber: '0771122888',
      image: '',
    };
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
      const lat = this.shopData.latitude;
      const lon = this.shopData.longitude;

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
