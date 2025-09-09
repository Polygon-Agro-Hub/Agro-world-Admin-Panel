import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-view-farm-owner',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-farm-owner.component.html',
  styleUrls: ['./view-farm-owner.component.css']
})
export class ViewFarmOwnerComponent implements OnInit {
  ownerId!: number;
  owner: FarmOwner = new FarmOwner();
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plantcareService: PlantcareUsersService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.ownerId = +this.route.snapshot.params['id']; // Get owner ID from route
    this.fetchOwner();
  }

back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.history.back(); // <-- goes to the previous page in history
    }
  });
}

  fetchOwner() {
    this.isLoading = true;
    this.plantcareService.getFarmOwnerById(this.ownerId).subscribe({
      next: (res) => {
        this.owner = res.result;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching farm owner:', err);
        this.isLoading = false;
      }
    });
  }
}

export class FarmOwner {
  id!: number;
  firstName: string = '';
  lastName: string = '';
  phoneCode: string = '';     // <--- Added
  phoneNumber: string = '';   // <--- Added
  nic: string = '';           // <--- Added
  role: string = '';    // Optional, if exists
  district: string = '';      // Optional
  accHolderName: string = ''; // Optional
  accNumber: string = '';     // Optional
  bankName: string = '';      // Optional
  branchName: string = '';    // Optional
}