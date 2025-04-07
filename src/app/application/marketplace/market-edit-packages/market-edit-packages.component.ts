import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

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

  constructor(private markServ: MarketPlaceService) {}

  ngOnInit(): void {
    this.fetchPackage(this.packageId);
  }

  fetchPackage(id: number): void {
    this.markServ.getPackageById(this.packageId).subscribe({
      next: (response) => {
        this.packageData = response;
      },
      error: (err) => {
        this.error = 'Failed to load package data';
        console.error('Error fetching package:', err);
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
