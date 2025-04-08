import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-market-edit-packages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './market-edit-packages.component.html',
  styleUrl: './market-edit-packages.component.css',
})
export class MarketEditPackagesComponent {
  packageData: Packages = new Packages();
  error: string | null = null;
  packageId!: number;
  selectedImage: string | ArrayBuffer | null = null;
  displayName: any;

  constructor(
    private markServ: MarketPlaceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params && params['id']) {
        this.packageId = +params['id']; // Convert string to number
        if (this.packageId) {
          this.getPackage();
        } else {
          console.error('No package ID provided');
          this.error = 'No package ID provided';
        }
      } else {
        console.error('Params are undefined');
        this.error = 'Failed to retrieve route parameters';
      }
    });
  }

  getPackage() {
    if (!this.packageId) return; // Optional: guard against empty packageId

    this.markServ.getPackageById(this.packageId).subscribe({
      next: (res) => {
        console.log('package:', res);
        this.packageData = res;
        this.selectedImage = res.image;
        this.displayName = res.displayName;
        // Add any other property assignments you need here
      },
      error: (err) => {
        console.error('Error fetching package:', err);
        this.error = 'Failed to load package details';
      },
    });
  }
}

class Packages {
  id!: number;
  displayName!: string;
  image!: string;
  description!: string;
  status!: string;
  total!: number;
  discount!: number;
  subtotal!: number;
  createdAt!: string;
}
