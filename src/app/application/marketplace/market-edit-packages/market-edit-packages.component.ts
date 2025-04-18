import { Component } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-market-edit-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
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
  keepFormEmptyOnLoad: boolean = true;
  loading = false;

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

  


  getDiscountPercentage(item: any): number {
    const normal = item.item.pricing.normalPrice;
    const discounted = item.item.pricing.discountedPrice;
    return ((normal - discounted) / normal) * 100;
  }
  
  getDiscountAmount(item: any, type: any): number {
    const normal = item.item.pricing.normalPrice;
    const discounted = item.item.pricing.discountedPrice;
  
    let finalDis = 0;
  
    if (type === 'g') {
      // For grams, we divide by 1000 to convert to kilograms.
      finalDis = (normal - discounted) * (Number(item.quantity || 0) / 1000);
    } else {
      // For kilograms, we use the quantity as is.
      finalDis = (normal - discounted) * Number(item.quantity || 0);
    }
  
    return finalDis;
  }
  
  

  // Method to increment the discount value for an item
  incrementDiscountValue(index: number, step: number = 1) {
    const item = this.packageItems[index];
    const { normalPrice, discountedPrice } = item.item.pricing;
  
    // Calculate the new discounted price based on the percentage step
    const discountPercentage = ((normalPrice - discountedPrice) / normalPrice) * 100;
    const newDiscountPercentage = discountPercentage + step;
  
    if (newDiscountPercentage <= 100) {
      item.item.pricing.discountedPrice = parseFloat(
        (normalPrice * (1 - newDiscountPercentage / 100)).toFixed(2)
      );
      this.calculatePackageTotals();
    }
  }

// Method to decrement the discount value for an item
decrementDiscountValue(index: number, step: number = 1) {
  const item = this.packageItems[index];
  const { normalPrice, discountedPrice } = item.item.pricing;

  // Calculate the new discounted price based on the percentage step
  const discountPercentage = ((normalPrice - discountedPrice) / normalPrice) * 100;
  const newDiscountPercentage = discountPercentage - step;

  if (newDiscountPercentage >= 0) {
    item.item.pricing.discountedPrice = parseFloat(
      (normalPrice * (1 - newDiscountPercentage / 100)).toFixed(2)
    );
    this.calculatePackageTotals();
  }
}



toggleUnitType(index: number, unit: string) {
  const item = this.packageItems[index];
  if (!item || item.quantityType === unit) return;

  // Convert between units
  if (unit === 'Kg') {
    // Convert g to Kg
    item.quantity = parseFloat((item.quantity / 1000).toFixed(2));
  } else {
    // Convert Kg to g
    item.quantity = Math.round(item.quantity * 1000);
  }
  
  item.quantityType = unit;
  this.calculatePackageTotals();
}





// incrementQuantity(index: number) {
//   const item = this.packageItems[index];
//   if (item.quantityType === 'g') {
//     // Increase by 100g (0.1 Kg in baseQuantity)
//     item.baseQuantity += 0.1;
//     item.quantity = item.baseQuantity * 1000; // Update display quantity in grams
//   } else {
//     // Increase by 0.1 Kg
//     item.quantity += 0.1;
   
//   }

//   this.calculatePackageTotals(); // Recalculate totals after quantity change
// }

// decrementQuantity(index: number) {
//   const item = this.packageItems[index];
//   if (item.quantityType === 'g') {
//     // Decrease by 100g (0.1 Kg in baseQuantity)
//     const newQuantity = item.baseQuantity - 0.1;
//     if (newQuantity >= 0) {
//       item.baseQuantity = newQuantity;
//       item.quantity = item.baseQuantity * 1000; // Update display quantity in grams
//     }
//   } else {
//     // Decrease by 0.1 Kg
//     const newQuantity = item.baseQuantity - 0.1;
//     if (newQuantity >= 0) {
//       item.baseQuantity = newQuantity;
//       item.quantity = parseFloat(item.baseQuantity.toFixed(2)); // Update display quantity in Kg
//     }
//   }

//   this.calculatePackageTotals(); // Recalculate totals after quantity change
// }


  // Add this helper method to display the quantity properly in the template


  getDisplayQuantity(item: any): number {
    // Simply return the stored quantity - we're now handling conversions properly
    return item.quantity || 0;
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
    const item = this.packageItems[index];
    if (!item) return;
  
    // Determine the increment step based on unit type
    const step = item.quantityType === 'Kg' ? 0.1 : 100;
    
    // Convert to grams if needed for calculation
    const currentValue = item.quantityType === 'Kg' ? item.quantity : item.quantity / 1000;
    const newValue = currentValue + (item.quantityType === 'Kg' ? step : step / 1000);
    
    // Update the quantity based on unit type
    item.quantity = item.quantityType === 'Kg' ? 
      parseFloat(newValue.toFixed(2)) : 
      Math.round(newValue * 1000);
    
    this.calculatePackageTotals();
  }
  
  decrementQuantity(index: number) {
    const item = this.packageItems[index];
    if (!item || item.quantity <= 0) return;
  
    // Determine the decrement step based on unit type
    const step = item.quantityType === 'Kg' ? 0.1 : 100;
    
    // Convert to grams if needed for calculation
    const currentValue = item.quantityType === 'Kg' ? item.quantity : item.quantity / 1000;
    let newValue = currentValue - (item.quantityType === 'Kg' ? step : step / 1000);
    
    // Ensure we don't go below 0
    newValue = Math.max(0, newValue);
    
    // Update the quantity based on unit type
    item.quantity = item.quantityType === 'Kg' ? 
      parseFloat(newValue.toFixed(2)) : 
      Math.round(newValue * 1000);
    
    this.calculatePackageTotals();
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
    this.loading = true;

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
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching package:', err);
        this.error = 'Failed to load package details';
        this.loading = false;
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
    this.loading = true;
    this.markServ.getProuctCropVerity().subscribe({
      next: (res) => {
        this.cropObj = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching crop data:', err);
        this.error = 'Failed to load crop data';
        this.loading = false;
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
          discount: this.inputPackageObj.normalPrice -
            this.inputPackageObj.discountedPrice,
          promo: false,
        },
        unitType: this.inputPackageObj.qtytype,
      },
      baseQuantity: this.inputPackageObj.qtytype === 'g'
        ? this.inputPackageObj.quantity! / 1000 // Convert g to Kg
        : this.inputPackageObj.quantity!, // Keep as Kg
    };
  
    this.packageItems.push(newItem);
    this.calculatePackageTotals();
    this.resetInputForm();
  }

  calculatePackageTotals() {
    let subtotal = 0;
    let totalDiscount = 0;
  
    this.packageItems.forEach((item) => {
      // Use baseQuantity for calculations
      const itemTotal = item.item.pricing.discountedPrice * item.baseQuantity;
      const itemDiscount =
        (item.item.pricing.normalPrice - item.item.pricing.discountedPrice) *
        item.baseQuantity;
  
      subtotal += itemTotal;
      totalDiscount += itemDiscount;
    });
  
    this.packageData.subtotal = subtotal;
    this.packageData.discount = totalDiscount; // Total discount for all items
    this.packageData.total = subtotal; // Total after applying discounts
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

  onCancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'All unsaved changes will be lost. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, discard changes',
      cancelButtonText: 'No, keep editing',
    }).then((result) => {
      if (result.isConfirmed) {
        // Reload the component to reset all changes
        window.location.reload();

        // Alternatively, you could manually reset all form fields:
        // this.resetForm();
        // this.getPackage(); // Reload original data
      }
    });
  }
}

// Interface and Class Definitions
interface PackageItem {
  id: number;
  quantity: number; // Display quantity (e.g., 2 Kg or 2000 g)
  baseQuantity: number; // Base quantity used for calculations (e.g., always in Kg)
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
