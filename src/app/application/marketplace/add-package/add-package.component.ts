import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-package',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-package.component.html',
  styleUrls: ['./add-package.component.css'],
})
export class AddPackageComponent implements OnInit {
  cropObj: Crop[] = [];
  selectedVarieties: Variety[] = [];
  selectedPrice: Variety = new Variety();
  packageObj: Package = new Package();
  inputPackageObj: InputPackage = new InputPackage();

  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectedFileName!: string;




  constructor(private marketSrv: MarketPlaceService, private router: Router) { }

  ngOnInit(): void {
    this.getCropProductData();
    this.packageObj.Items = [new Items()];
    this.packageObj.Items.pop();
  }

  getCropProductData() {
    this.marketSrv.getProuctCropVerity().subscribe((res) => {
      console.log(res);

      this.cropObj = res;
    });
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

  onPriceChange() {
    const selectedVariety = this.selectedVarieties.find(
      (variety) => variety.id === +this.inputPackageObj.mpItemId
    );
    if (selectedVariety) {
      this.selectedPrice = selectedVariety;
    } else {
      this.selectedPrice = new Variety();
    }
  }

  onAdd() {
    if (!this.inputPackageObj.qtytype || !this.inputPackageObj.mpItemId || !this.inputPackageObj.cID || !this.packageObj.name) {
      Swal.fire('Warning', 'Please fill in all the required fields', 'warning');
      return;
    }

    this.packageObj.Items.push({
      displayName: this.selectedPrice.displayName,
      mpItemId: this.inputPackageObj.mpItemId,
      quantity: this.inputPackageObj.quantity,
      discountedPrice: this.selectedPrice.discountedPrice,
      qtytype: this.inputPackageObj.qtytype,
      itemName: this.selectedPrice.displayName,
      normalPrice: this.selectedPrice.normalPrice,
    });
    this.inputPackageObj = new InputPackage();
    this.selectedPrice = new Variety();
  }

  onSubmit() {
    if (this.packageObj.Items.length === 0) {
      Swal.fire('Error!', 'Pleace add product before submit', 'error');
      return;
    }

    this.marketSrv.createPackage(this.packageObj, this.selectedImage).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Package Created',
            text: 'The package was created successfully!',
            confirmButtonText: 'OK'
          }).then(() => {
            this.packageObj = new Package();
            this.router.navigate(['/market/action/add-package'])
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Package Not Created',
            text: 'The package could not be created. Please try again.',
            confirmButtonText: 'OK'
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'An Error Occurred',
          text: 'There was an error while creating the package. Please try again later.',
          confirmButtonText: 'OK'
        });
      }
    );
  }


  onCancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'All unsaved changes will be lost. Do you want to cancel?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, keep editing'
    }).then((result) => {
      if (result.isConfirmed) {
        this.inputPackageObj = new InputPackage();
        this.packageObj = new Package();
        Swal.fire('Cancelled', 'Your changes have been discarded.', 'success');
      }
    });
  }

  incrementQuantity(index: number) {
    if (this.packageObj.Items[index]) {
      this.packageObj.Items[index].quantity += 1;
    }
  }

  decrementQuantity(index: number) {
    if (this.packageObj.Items[index] && this.packageObj.Items[index].quantity > 0) {
      this.packageObj.Items[index].quantity -= 1;
    }
  }

  decrementDiscount(index: number, step: number = 1.0) {
    if (this.packageObj.Items[index] && this.packageObj.Items[index].discountedPrice > 0) {
      const newPrice = this.packageObj.Items[index].discountedPrice - step;
      this.packageObj.Items[index].discountedPrice = newPrice >= 0 ? parseFloat(newPrice.toFixed(2)) : 0;
    }
  }

  incrementDiscount(index: number) {
    if (this.packageObj.Items[index]) {
      this.packageObj.Items[index].discountedPrice += 1.00;
      this.packageObj.Items[index].discountedPrice = parseFloat(this.packageObj.Items[index].discountedPrice.toFixed(2));
    }
  }



  removeItem(index: number) {
    if (index >= 0 && index < this.packageObj.Items.length) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to remove this item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.isConfirmed) {
          this.packageObj.Items.splice(index, 1);
          Swal.fire('Removed!', 'The item has been removed.', 'success');
        }
      });
    }
  }


  getTotalPrice(): number {
    return this.packageObj.Items.reduce((sum, item) => {
      let totalPrice;
      const actualPrice = item.normalPrice * item.quantity;
      const discountedValue = item.discountedPrice || 0;
      totalPrice = sum + (actualPrice - discountedValue)
      this.packageObj.total = totalPrice;
      return totalPrice;
    }, 0);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        Swal.fire('Error', 'File size should not exceed 5MB', 'error');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire('Error', 'Only JPEG, JPG and PNG files are allowed', 'error');
        return;
      }

      this.selectedFile = file;
      this.packageObj.image = file;
      this.selectedFileName = file.name;
      this.packageObj.selectedFileName = file.name;


      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(event: Event): void {
    event.preventDefault();
    const fileInput = document.getElementById('imageUpload');
    fileInput?.click();
  }

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

class Package {
  name!: string;
  status: string = 'Disabled';
  Items: Items[] = [];
  cID!: number;
  total!: number;
  description!: string;
  image!: any;
  selectedFileName!: string;
  portion!: string;
  period!: string;
}

class Items {
  displayName: string | undefined = undefined;
  mpItemId!: number;
  quantity: number = 0;
  discountedPrice: number = 0;
  qtytype: string = '';
  itemName: string | undefined = '';
  normalPrice: number = 0;
}

class InputPackage {
  name!: string;
  status: string = 'Disabled';
  cID!: number;
  packageId!: number;
  mpItemId!: number;
  quantity: number = 0;
  discountedPrice: number = 0;
  qtytype: string = '';
  itemName!: string;
  normalPrice!: number;
}