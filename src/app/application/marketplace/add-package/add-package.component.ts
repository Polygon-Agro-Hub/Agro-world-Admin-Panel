import { Component, OnInit } from '@angular/core';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-package',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-package.component.html',
  styleUrls: ['./add-package.component.css'],
})
export class AddPackageComponent implements OnInit {
  cropObj: Crop[] = []; // List of crops
  selectedVarieties: Variety[] = []; // Varieties based on selected crop
  selectedPrice?: Variety; // Selected variety price details
  packageObj: Package = new Package(); // Final package object
  formCount: number = 0; // Count for forms to map items
  inputPackageObj: InputPackage = new InputPackage(); // Input object for binding

  constructor(private marketSrv: MarketPlaceService) { }

  ngOnInit(): void {
    this.getCropProductData();
    this.packageObj.Items = [new Items()];
  }

  getCropProductData() {
    this.marketSrv.getProuctCropVerity().subscribe((res) => {
      console.log('Crop Data:', res);
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
      console.error('No matching crop found.');
      this.selectedVarieties = [];
    }
  }

  onPriceChange() {
    const selectedVariety = this.selectedVarieties.find(
      (variety) => variety.id === +this.inputPackageObj.mpItemId
    );

    if (selectedVariety) {
      this.selectedPrice = selectedVariety;
      this.packageObj.Items[this.formCount].normalPrice = this.selectedPrice?.normalPrice;
      this.packageObj.Items[this.formCount].discountedPrice = this.selectedPrice?.discountedPrice;
      this.packageObj.Items[this.formCount].itemName = this.selectedPrice?.displayName;
    } else {
      console.error('No matching variety found.');
      this.selectedPrice = undefined;
    }
  }

  // Add a new item to the package
  onAdd() {
    console.log(this.inputPackageObj);
    console.log(this.packageObj);

    // this.packageObj.name = this.inputPackageObj.name;
    // this.packageObj.Items[this.formCount] = {
    //   ...this.packageObj.Items[this.formCount],
    //   mpItemId: this.inputPackageObj.mpItemId,
    //   quantity: this.inputPackageObj.quantity,
    //   qtytype: this.inputPackageObj.qtytype,
    // };

    this.packageObj.Items.push(
      
    )

    // this.packageObj.Items.push(new Items());
    this.inputPackageObj = new InputPackage();
  }

  onSubmit() {
    console.log(this.packageObj);
  }

  onCancel() {
    console.log('Operation cancelled.');
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

  // Remove an item from the package
  removeItem(index: number) {
    if (index >= 0 && index < this.packageObj.Items.length) {
      this.packageObj.Items.splice(index, 1);
    }
  }
}

// Models and classes
class Crop {
  cropId!: number;
  cropNameEnglish!: string;
  variety!: Variety[];
}

class Variety {
  id!: number;
  displayName!: string;
  normalPrice!: number;
  discountedPrice!: number;
}

class Package {
  name!: string;
  status: string = 'Disabled';
  Items: Items[] = [];
  cID!: number;
}

class Items {
  displayName!: string;
  mpItemId!: number;
  quantity: number = 0;
  discountedPrice: number = 0;
  qtytype!: string;
  itemName!: string;
  normalPrice!: number;
}

class InputPackage {
  name!: string;
  status: string = 'Disabled';
  cID!: number;
  packageId!: number;
  mpItemId!: number;
  quantity: number = 0;
  discountedPrice: number = 0;
  qtytype!: string;
  itemName!: string;
  normalPrice!: number;
}
