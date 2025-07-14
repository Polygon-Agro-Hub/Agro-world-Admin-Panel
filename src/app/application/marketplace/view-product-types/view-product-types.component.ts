// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { MarketPlaceService } from '../../../services/market-place/market-place.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-view-product-types',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './view-product-types.component.html',
//   styleUrl: './view-product-types.component.css',
// })
// export class ViewProductTypesComponent implements OnInit {
//   productArr: ProductType[] = []

//   hasData: boolean = false;
//   productCount: number = 0;

//   constructor(
//     private marketSrv: MarketPlaceService,
//     private router: Router
//   ) { }

//   ngOnInit(): void {
//     this.fetchProductType();
//   }

//   fetchProductType() {
//     this.marketSrv.getAllProductType().subscribe(
//       (res) => {
//         this.productArr = res.data;
//         this.productCount = res.data.length
//         this.productCount > 0 ? this.hasData = true : this.hasData = false;
//       }
//     )
//   }

//   deleteProductType(id: number): void {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'You won\'t be able to revert this!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, delete it!'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.marketSrv.deleteProductType(id).subscribe({
//           next: (res) => {
//             if (res.status) {
//               Swal.fire({
//                 icon: 'success',
//                 title: 'Deleted!',
//                 text: res.message || 'Product type deleted successfully.',
//               });
//               this.fetchProductType();
//             } else {
//               Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: res.message || 'Failed to delete product type.',
//               });
//             }
//           },
//           error: (err) => {
//             console.error(err);
//           }
//         });
//       }
//     });
//   }

//   navigateToBack(): void {
//     this.router.navigate(['/market/action']);
//   }

//   navigateToAdd(): void {
//     this.router.navigate(['/market/action/add-product-type']);
//   }

//   navigateEdit(id: number): void {
//     this.router.navigate([`/market/action/edit-product-type/${id}`]);
//   }
// }


// class ProductType {
//   id!: number;
//   typeName!: string;
//   shortCode!: string;
// }

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-product-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-product-types.component.html',
  styleUrl: './view-product-types.component.css',
})
export class ViewProductTypesComponent implements OnInit {
  productArr: ProductType[] = [];
  filteredProductArr: ProductType[] = [];
  hasData: boolean = false;
  productCount: number = 0;
  searchText: string = '';

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProductType();
  }

  fetchProductType() {
    this.marketSrv.getAllProductType().subscribe(
      (res) => {
        this.productArr = res.data;
        this.filteredProductArr = res.data;
        this.productCount = res.data.length;
        this.hasData = this.productCount > 0;
      }
    );
  }

  filterProducts(): void {
    const search = this.searchText.toLowerCase().trim();
    if (search) {
      this.filteredProductArr = this.productArr.filter(product =>
        product.typeName.toLowerCase().includes(search) ||
        product.shortCode.toLowerCase().includes(search)
      );
    } else {
      this.filteredProductArr = [...this.productArr];
    }
    this.productCount = this.filteredProductArr.length;
    this.hasData = this.productCount > 0;
  }

  clearSearch(): void {
    this.searchText = '';
    this.filterProducts();
  }

  deleteProductType(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.marketSrv.deleteProductType(id).subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: res.message || 'Product type deleted successfully.',
              });
              this.fetchProductType();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message || 'Failed to delete product type.',
              });
            }
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    });
  }

  navigateToBack(): void {
    this.router.navigate(['/market/action']);
  }

  navigateToAdd(): void {
    this.router.navigate(['/market/action/add-product-type']);
  }

  navigateEdit(id: number): void {
    this.router.navigate([`/market/action/edit-product-type/${id}`]);
  }
}

class ProductType {
  id!: number;
  typeName!: string;
  shortCode!: string;
}