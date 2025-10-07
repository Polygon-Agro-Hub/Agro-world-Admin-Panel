import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-field-officer-profile',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './field-officer-profile.component.html',
  styleUrl: './field-officer-profile.component.css'
})
export class FieldOfficerProfileComponent {

  officerObj: FieldOfficer = new FieldOfficer();
  officerId!: number;
  isLoading = false;
  isGeneratingPDF = false;

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private collectionOfficerService: CollectionOfficerService,
    private plantcareService: PlantcareUsersService,
    private router: Router,
    private location: Location,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['id'];
    this.fetchOfficerById(this.officerId);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }


  fetchOfficerById(id: number) {
    this.isLoading = true;
    this.plantcareService
      .fetchAllfieldOfficerProfile(id)
      .subscribe((res: any) => {
        console.log("this is data", res);

        this.isLoading = false;
        this.officerObj = res.officerData.fieldOfficer;
      });
  }


  goBack() {
    window.history.back();
  }

  // viewOfficerTarget(officerId: number) {
  //   this.router.navigate([
  //     `/steckholders/action/collective-officer/view-officer-targets/${officerId}`,
  //   ]);
  // }


  openImage(url: string): void {
    if (url) {
      window.open(url, '_blank'); // Opens image in a new tab
    }
  }

  editFieldOfficer(id: number) {
    this.navigatePath(
      `/steckholders/action/edit-field-officer/${id}`
    );
  }

  deleteFieldOfficer(id: number) {
    const token = this.tokenService.getToken();
    if (!token) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Field Officer? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
        confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
        cancelButton: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2'
      },
      buttonsStyling: false, // let Tailwind handle button styling
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.plantcareService.deleteFieldOfficer(id).subscribe(
          (data) => {
            this.isLoading = false;
            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The Field Officer has been deleted.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
              this.router.navigate(['/steckholders/action']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'There was an error deleting the Field Officer.',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold',
                  confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                },
                buttonsStyling: false
              });
            }
          },
          () => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'There was an error deleting the Field Officer.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },
              buttonsStyling: false
            });
          }
        );
      }
    });
  }
}

class FieldOfficer {
  id!: number;
  firstName!: string;
  lastName!: string;
  phoneNumber01!: string;
  phoneNumber02!: string;
  phoneCode01!: string;
  phoneCode02!: string;
  image!: string;
  frontNic!: string;
  backNic!: string;
  backPassbook!: string;
  contract!: string;
  nic!: string;
  email!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country!: string;
  empId!: string;
  jobRole!: string;
  accHolderName!: string;
  accNumber!: string;
  bankName!: string;
  branchName!: string;
  companyName!: string;
  status!: string;
  assignDistricts: [] = [];
  comAmount!: string;
  language!: string;
}

