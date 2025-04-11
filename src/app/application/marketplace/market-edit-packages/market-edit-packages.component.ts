// import { Component } from '@angular/core';
// import { MarketPlaceService } from '../../../services/market-place/market-place.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-market-edit-packages',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './market-edit-packages.component.html',
//   styleUrl: './market-edit-packages.component.css',
// })
// export class MarketEditPackagesComponent {
//   cropObj: Crop[] = [];
//   packageData: Package = new Package();
//   error: string | null = null;
//   packageId!: number;
//   selectedImage: string | ArrayBuffer | null = null;
//   displayName: string = '';
//   inputPackageObj: InputPackage = new InputPackage();
//   selectedVarieties: Variety[] = [];
//   packageItems: PackageItem[] = [];

//   constructor(
//     private markServ: MarketPlaceService,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit(): void {
//     this.route.params.subscribe((params) => {
//       if (params && params['id']) {
//         this.packageId = +params['id'];
//         if (this.packageId) {
//           this.getCropProductData(); // Load crops first
//           this.getPackage(); // Then load package data
//         } else {
//           console.error('No package ID provided');
//           this.error = 'No package ID provided';
//         }
//       } else {
//         console.error('Params are undefined');
//         this.error = 'Failed to retrieve route parameters';
//       }
//     });
//   }

//   getPackage() {
//     if (!this.packageId) return;

//     this.markServ.getPackageById(this.packageId).subscribe({
//       next: (res) => {
//         if (res.success && res.data?.package) {
//           const packageData = res.data.package;

//           // Set main package data
//           this.packageData = {
//             id: packageData.id,
//             displayName: packageData.displayName,
//             image: packageData.image,
//             description: packageData.description,
//             status: packageData.status,
//             total: packageData.pricing.total,
//             discount: packageData.pricing.discount,
//             subtotal: packageData.pricing.subtotal,
//             createdAt: packageData.createdAt,
//             items: packageData.items,
//           };

//           this.selectedImage = packageData.image;
//           this.displayName = packageData.displayName;
//           this.packageItems = packageData.items || [];

//           // Initialize form with first item if exists
//           if (this.packageItems.length > 0) {
//             this.initFormWithFirstItem();
//           }
//         }
//       },
//       error: (err) => {
//         console.error('Error fetching package:', err);
//         this.error = 'Failed to load package details';
//       },
//     });
//   }

//   initFormWithFirstItem() {
//     if (!this.packageItems.length) return;

//     const firstItem = this.packageItems[0];
//     this.inputPackageObj = {
//       name: this.packageData.displayName,
//       status: this.packageData.status,
//       cID: 0, // Will be set after crop data loads
//       packageId: this.packageData.id,
//       mpItemId: firstItem.item.id,
//       quantity: firstItem.price,
//       discountedPrice: firstItem.item.pricing.discountedPrice,
//       qtytype: firstItem.quantityType,
//       itemName: firstItem.item.displayName,
//       normalPrice: firstItem.item.pricing.normalPrice,
//     };

//     // Find matching crop if crops are already loaded
//     if (this.cropObj.length > 0) {
//       this.setCropAndVarietyForItem(firstItem);
//     }
//   }

//   getCropProductData() {
//     this.markServ.getProuctCropVerity().subscribe({
//       next: (res) => {
//         this.cropObj = res;

//         // After crops load, try to set the crop ID if we have package data
//         if (this.packageItems.length > 0) {
//           this.setCropAndVarietyForItem(this.packageItems[0]);
//         }
//       },
//       error: (err) => {
//         console.error('Error fetching crop data:', err);
//         this.error = 'Failed to load crop data';
//       },
//     });
//   }

//   setCropAndVarietyForItem(item: PackageItem) {
//     const matchingCrop = this.cropObj.find((crop) =>
//       crop.variety.some((v) => v.id === item.item.id)
//     );

//     if (matchingCrop) {
//       this.inputPackageObj.cID = matchingCrop.cropId;
//       this.onCropChange(); // Trigger variety list update
//       // Set the variety selection
//       setTimeout(() => {
//         this.inputPackageObj.mpItemId = item.item.id;
//       }, 0);
//     }
//   }

//   onCropChange() {
//     const selectedCrop = this.cropObj.find(
//       (crop) => crop.cropId === +this.inputPackageObj.cID
//     );
//     if (selectedCrop) {
//       this.selectedVarieties = selectedCrop.variety;
//     } else {
//       this.selectedVarieties = [];
//     }
//   }

//   // Add this method to handle image selection
//   onImageSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         this.selectedImage = e.target?.result as string;
//         this.packageData.image = this.selectedImage as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }
// }

// // Interface and Class Definitions
// interface PackageItem {
//   id: number;
//   quantityType: string;
//   price: number;
//   item: {
//     id: number;
//     varietyId: number;
//     displayName: string;
//     category: string;
//     pricing: {
//       normalPrice: number;
//       discountedPrice: number;
//       discount: number;
//       promo: boolean;
//     };
//     unitType: string;
//   };
// }

// class Package {
//   id!: number;
//   displayName!: string;
//   image!: string;
//   description!: string;
//   status: string = 'Disabled';
//   total!: number;
//   discount!: number;
//   subtotal!: number;
//   createdAt!: string;
//   items: PackageItem[] = [];
// }

// class Crop {
//   cropId!: number;
//   cropNameEnglish!: string;
//   variety!: Variety[];
// }

// class Variety {
//   id!: number;
//   displayName: string = '';
//   normalPrice: number = 0;
//   discountedPrice: number = 0;
// }

// class InputPackage {
//   name: string = '';
//   status: string = 'Disabled';
//   cID: number = 0;
//   packageId: number = 0;
//   mpItemId: number = 0;
//   quantity: number = 0;
//   discountedPrice: number = 0;
//   qtytype: string = '';
//   itemName: string = '';
//   normalPrice: number = 0;
// }

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
  cropObj: Crop[] = [];
  packageData: Package = new Package();
  error: string | null = null;
  packageId!: number;
  selectedImage: string | ArrayBuffer | null = null;
  displayName: string = '';
  inputPackageObj: InputPackage = new InputPackage();
  selectedVarieties: Variety[] = [];
  packageItems: PackageItem[] = [];

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

          // Initialize form with first item if exists
          if (this.packageItems.length > 0) {
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
      cID: 0, // Will be set after crop data loads
      packageId: this.packageData.id,
      mpItemId: firstItem.item.id,
      quantity: firstItem.quantity, // Using the quantity from package item
      discountedPrice: firstItem.item.pricing.discountedPrice,
      qtytype: firstItem.quantityType,
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

        // After crops load, try to set the crop ID if we have package data
        if (this.packageItems.length > 0) {
          this.setCropAndVarietyForItem(this.packageItems[0]);
        }
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
      }, 0);
    }
  }

  onCropChange() {
    const selectedCrop = this.cropObj.find(
      (crop) => crop.cropId === +this.inputPackageObj.cID
    );
    if (selectedCrop) {
      this.selectedVarieties = selectedCrop.variety;
    } else {
      this.selectedVarieties = [];
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

  // Add any additional methods you need for form submission, etc.
}

// Interface and Class Definitions
interface PackageItem {
  id: number;
  quantity: number;
  quantityType: string;
  price: number;
  item: {
    id: number;
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
  cID: number = 0;
  packageId: number = 0;
  mpItemId: number = 0;
  quantity: number = 0;
  discountedPrice: number = 0;
  qtytype: string = '';
  itemName: string = '';
  normalPrice: number = 0;
}
