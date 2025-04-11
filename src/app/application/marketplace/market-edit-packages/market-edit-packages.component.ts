import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-market-edit-packages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './market-edit-packages.component.html',
  styleUrl: './market-edit-packages.component.css',
})
export class MarketEditPackagesComponent {
  cropObj: Crop[] = [];
  packageData: Package = new Package();
  error: string | null = null;
  packageId!: number;
  selectedImage: string | ArrayBuffer | null = null;
  displayName: string = '';
  inputPackageObj: InputPackage = new InputPackage();
  selectedVarieties: Variety[] = [];
  packageItems: PackageItem[] = [];
  selectedPrice: Variety = new Variety();
  keepFormEmptyOnLoad: boolean = true; // Control whether form starts empty

  constructor(
    private markServ: MarketPlaceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params && params['id']) {
        this.packageId = +params['id'];
        if (this.packageId) {
          this.getCropProductData(); // Load crops first
          this.getPackage(); // Then load package data
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

  removeItem(index: number) {
    if (index >= 0 && index < this.packageItems.length) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to remove this item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'No, keep it',
      }).then((result) => {
        if (result.isConfirmed) {
          this.packageItems.splice(index, 1);
          this.calculatePackageTotals();
          Swal.fire('Removed!', 'The item has been removed.', 'success');
        }
      });
    }
  }

  incrementQuantity(index: number) {
    if (this.packageItems[index]) {
      this.packageItems[index].quantity += 1;
      this.calculatePackageTotals();
    }
  }

  decrementQuantity(index: number) {
    if (this.packageItems[index] && this.packageItems[index].quantity > 0) {
      this.packageItems[index].quantity -= 1;
      this.calculatePackageTotals();
    }
  }

  decrementDiscount(index: number, step: number = 1.0) {
    if (
      this.packageItems[index] &&
      this.packageItems[index].item.pricing.discountedPrice > 0
    ) {
      const newPrice =
        this.packageItems[index].item.pricing.discountedPrice - step;
      this.packageItems[index].item.pricing.discountedPrice =
        newPrice >= 0 ? parseFloat(newPrice.toFixed(2)) : 0;
      this.calculatePackageTotals();
    }
  }

  incrementDiscount(index: number, step: number = 1.0) {
    if (this.packageItems[index]) {
      this.packageItems[index].item.pricing.discountedPrice += step;
      this.packageItems[index].item.pricing.discountedPrice = parseFloat(
        this.packageItems[index].item.pricing.discountedPrice.toFixed(2)
      );
      this.calculatePackageTotals();
    }
  }

  getPackage() {
    if (!this.packageId) return;

    this.markServ.getPackageById(this.packageId).subscribe({
      next: (res) => {
        if (res.success && res.data?.package) {
          const packageData = res.data.package;

          // Set main package data
          this.packageData = {
            id: packageData.id,
            displayName: packageData.displayName,
            image: packageData.image,
            description: packageData.description,
            status: packageData.status,
            total: packageData.pricing.total,
            discount: packageData.pricing.discount,
            subtotal: packageData.pricing.subtotal,
            createdAt: packageData.createdAt,
            items: packageData.items,
          };

          this.selectedImage = packageData.image;
          this.displayName = packageData.displayName;
          this.packageItems = packageData.items || [];

          console.log('My data', packageData);

          // Initialize form - will be empty if keepFormEmptyOnLoad is true
          if (this.packageItems.length > 0 && !this.keepFormEmptyOnLoad) {
            this.initFormWithFirstItem();
          }
        }
      },
      error: (err) => {
        console.error('Error fetching package:', err);
        this.error = 'Failed to load package details';
      },
    });
  }

  initFormWithFirstItem() {
    if (!this.packageItems.length) return;

    const firstItem = this.packageItems[0];
    this.inputPackageObj = {
      name: this.packageData.displayName,
      status: this.packageData.status,
      cID: null, // Start with null
      packageId: this.packageData.id,
      mpItemId: null, // Start with null
      quantity: null, // Start with null
      discountedPrice: firstItem.item.pricing.discountedPrice,
      qtytype: '',
      itemName: firstItem.item.displayName,
      normalPrice: firstItem.item.pricing.normalPrice,
    };

    // Find matching crop if crops are already loaded
    if (this.cropObj.length > 0) {
      this.setCropAndVarietyForItem(firstItem);
    }
  }

  getCropProductData() {
    this.markServ.getProuctCropVerity().subscribe({
      next: (res) => {
        this.cropObj = res;
      },
      error: (err) => {
        console.error('Error fetching crop data:', err);
        this.error = 'Failed to load crop data';
      },
    });
  }

  setCropAndVarietyForItem(item: PackageItem) {
    const matchingCrop = this.cropObj.find((crop) =>
      crop.variety.some((v) => v.id === item.item.id)
    );

    if (matchingCrop) {
      this.inputPackageObj.cID = matchingCrop.cropId;
      this.onCropChange(); // Trigger variety list update
      // Set the variety selection
      setTimeout(() => {
        this.inputPackageObj.mpItemId = item.item.id;
        this.onPriceChange();
      }, 0);
    }
  }

  onCropChange() {
    // Reset dependent fields when crop changes
    this.inputPackageObj.mpItemId = null;
    this.inputPackageObj.quantity = null;
    this.inputPackageObj.qtytype = '';
    this.selectedPrice = new Variety();

    const selectedCrop = this.cropObj.find(
      (crop) => crop.cropId === +this.inputPackageObj.cID!
    );

    this.selectedVarieties = selectedCrop ? [...selectedCrop.variety] : [];
    console.log('Varieties after crop change:', this.selectedVarieties);
  }

  onPriceChange() {
    const selectedVariety = this.selectedVarieties.find(
      (variety) => variety.id === +this.inputPackageObj.mpItemId!
    );
    if (selectedVariety) {
      this.selectedPrice = selectedVariety;
      this.inputPackageObj.normalPrice = selectedVariety.normalPrice;
      this.inputPackageObj.discountedPrice = selectedVariety.discountedPrice;
    } else {
      this.selectedPrice = new Variety();
      this.inputPackageObj.normalPrice = 0;
      this.inputPackageObj.discountedPrice = 0;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
        this.packageData.image = this.selectedImage as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onAdd() {
    if (
      !this.inputPackageObj.qtytype ||
      !this.inputPackageObj.mpItemId ||
      !this.inputPackageObj.cID ||
      !this.packageData.displayName ||
      !this.inputPackageObj.quantity
    ) {
      Swal.fire('Warning', 'Please fill in all the required fields', 'warning');
      return;
    }

    console.log('Selected varieties:', this.selectedVarieties);
    console.log('Looking for item ID:', this.inputPackageObj.mpItemId);

    const selectedVariety = this.selectedVarieties.find(
      (v) => v.id === +this.inputPackageObj.mpItemId!
    );

    if (!selectedVariety) {
      console.error(
        'Available variety IDs:',
        this.selectedVarieties.map((v) => v.id)
      );
      Swal.fire('Error', 'Selected item not found', 'error');
      return;
    }

    const newItem: PackageItem = {
      id: 0,
      quantity: this.inputPackageObj.quantity,
      quantityType: this.inputPackageObj.qtytype,
      price: this.inputPackageObj.discountedPrice,
      item: {
        id: this.inputPackageObj.mpItemId,
        mpItemId: this.inputPackageObj.mpItemId!, // Ensure mpItemId is included
        varietyId: this.inputPackageObj.mpItemId,
        displayName: selectedVariety.displayName,
        category: '',
        pricing: {
          normalPrice: this.inputPackageObj.normalPrice,
          discountedPrice: this.inputPackageObj.discountedPrice,
          discount:
            this.inputPackageObj.normalPrice -
            this.inputPackageObj.discountedPrice,
          promo: false,
        },
        unitType: this.inputPackageObj.qtytype,
      },
    };

    this.packageItems.push(newItem);
    this.calculatePackageTotals();
    this.resetInputForm();
  }

  calculatePackageTotals() {
    let subtotal = 0;
    this.packageItems.forEach((item) => {
      subtotal += item.price * item.quantity;
    });
    this.packageData.subtotal = subtotal;
    this.packageData.discount = 0;
    this.packageData.total = subtotal - this.packageData.discount;
  }

  resetInputForm() {
    this.inputPackageObj = new InputPackage();
    this.selectedVarieties = [];
    this.selectedPrice = new Variety();
  }

  numberOnly(event: KeyboardEvent): boolean {
    return /^\d*$/.test(event.key);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    if (/^\d+$/.test(pastedText)) {
      this.inputPackageObj.quantity = parseInt(pastedText, 10);
    }
  }

  onSave() {
    if (!this.packageData.displayName || !this.packageItems.length) {
      Swal.fire(
        'Warning',
        'Package name and at least one item are required',
        'warning'
      );
      return;
    }

    // Prepare the package data
    const packageData = {
      displayName: this.packageData.displayName,
      status: this.packageData.status,
      description: this.packageData.description || '',
      discount: Number(this.packageData.discount) || 0,
      total: Number(this.packageData.total) || 0,
      packageId: this.packageId,
      existingImage: this.packageData.image,
      Items: this.packageItems.map((item) => ({
        mpItemId: Number(item.item.mpItemId), // Ensure this is a number
        quantity: Number(item.quantity), // Ensure this is a number
        qtytype: item.quantityType,
        discountedPrice: Number(item.price), // Ensure this is a number
      })),
    };

    console.log('this is package data', packageData);

    // Handle image
    let imageToUpload: string | undefined = undefined;
    if (
      typeof this.selectedImage === 'string' &&
      this.selectedImage.startsWith('data:image')
    ) {
      imageToUpload = this.selectedImage || undefined;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to update this package',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.showLoading();

        this.markServ
          .updatePackage(packageData, this.packageId, imageToUpload)
          .subscribe({
            next: (res) => {
              Swal.fire('Success!', 'Package updated successfully', 'success');
            },
            error: (err) => {
              console.error('Error updating package:', err);
              Swal.fire('Error!', 'Failed to update package', 'error');
            },
          });
      }
    });
  }
}

// Interface and Class Definitions
interface PackageItem {
  id: number;
  quantity: number;
  quantityType: string;
  price: number;
  item: {
    id: number;
    mpItemId: number;
    varietyId: number;
    displayName: string;
    category: string;
    pricing: {
      normalPrice: number;
      discountedPrice: number;
      discount: number;
      promo: boolean;
    };
    unitType: string;
  };
}

class Package {
  id!: number;
  displayName!: string;
  image!: string;
  description!: string;
  status: string = 'Disabled';
  total!: number;
  discount!: number;
  subtotal!: number;
  createdAt!: string;
  items: PackageItem[] = [];
}

class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class Variety {
  id!: number;
  displayName: string = '';
  normalPrice: number = 0;
  discountedPrice: number = 0;
}

class InputPackage {
  name: string = '';
  status: string = 'Disabled';
  cID: number | null = null;
  packageId: number = 0;
  mpItemId: number | null = null;
  quantity: number | null = null;
  discountedPrice: number = 0;
  qtytype: string = '';
  itemName: string = '';
  normalPrice: number = 0;
}
