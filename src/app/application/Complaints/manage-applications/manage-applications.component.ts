import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';

import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ComplaintsService } from '../../../services/complaints/complaints.service';


@Component({
  selector: 'app-manage-applications',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './manage-applications.component.html',
  styleUrl: './manage-applications.component.css'
})
export class ManageApplicationsComponent {
  systemApplicationsArr!: SystemApplications[];

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private complaintSrv: ComplaintsService

  ) { }

  ngOnInit(): void {

    this.fetchAllSystemApplications();

  }

  fetchAllSystemApplications() {


    console.log("fetching started");
    // this.isLoading = true;
    this.complaintSrv.getAllSystemApplications().subscribe(

      (res) => {
        console.log('dtgsgdgdg', res);


        this.systemApplicationsArr = res;

      },
      (error) => {
        console.log("Error: ", error);
        // this.isLoading = false;
      }
    );
  }



  showAlert(systemAppId: number) {
    console.log("Fetching data for System Application ID: ", systemAppId);

    this.complaintSrv.getComplainCategoriesByAppId(systemAppId).subscribe((res: any) => {
      console.log(res);

      let htmlContent = '';

      if (res.length === 0) {
        htmlContent = `<p class="swal-content">No any complaint categories added.</p>`;
      } else {
        const categoryList = res
          .map((x: any, index: number) => `<tr><td class="font-bold text-center">${index + 1}.</td><td class="text-start">${x.categoryEnglish}</td></tr>`)
          .join('');

        htmlContent = `<table class="swal-table w-full">${categoryList}</table>`;
      }

      Swal.fire({
        title: 'Plant Care Complaint Categories',
        html: htmlContent,
        showConfirmButton: false,
        didOpen: () => {
          // Apply Tailwind styles using document.querySelector
          const swalPopup = document.querySelector('.swal2-popup') as HTMLElement;
          if (swalPopup) {
            swalPopup.classList.add('bg-gray-100', 'rounded-lg', 'shadow-lg', 'p-6', 'w-[400px]', 'dark:dark:bg-tileBlack');
          }

          const swalTitle = document.querySelector('.swal2-title') as HTMLElement;
          if (swalTitle) {
            swalTitle.classList.add('text-lg', 'font-semibold', 'text-gray-800', 'dark:text-textDark');
          }

          const swalContent = document.querySelector('.swal-content') as HTMLElement;
          if (swalContent) {
            swalContent.classList.add('text-gray-600', 'text-center', 'text-lg', 'dark:text-textDark');
          }

          const swalTable = document.querySelector('.swal-table') as HTMLElement;
          if (swalTable) {
            swalTable.classList.add('border-collapse', 'text-lg', 'w-full', 'dark:text-textDark');
          }

          const tableRows = document.querySelectorAll('.swal-table tr');
          tableRows.forEach(row => {
            row.classList.add('border-b', 'border-gray-300', 'p-2');
          });

          const tableCells = document.querySelectorAll('.swal-table td');
          tableCells.forEach(cell => {
            cell.classList.add('px-4', 'py-2', 'text-gray-700', 'dark:text-textDark');
          });
        }
      });
    });
  }


  // swal2-input w-48 h-16 text-sm rounded-lg px-2 border border-gray-300 
  // focus:border-blue-500 focus:outline-none
  addNewApp() {
    Swal.fire({
      // title: 'Add New Application',
      html: `
      <div>
      <h1 class="mb-8 font-semibold text-black dark:text-textDark">Add New Application</h1>
      <div class="flex items-center gap-4 ">
        <label for="appName" class="whitespace-nowrap text-base dark:text-textDark">Application Name</label>
        <input id="appName" type="text" 
             class="text-sm rounded-lg p-3  w-full max-w-xs border h-10 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400" />
      </div>
      
    `,
      showCancelButton: true,
      confirmButtonText: 'Add', // "Add" (Blue) second
      cancelButtonText: 'Cancel', // "Cancel" (Gray) first
      reverseButtons: true, // Keeps cancel button first

      customClass: {
        popup: 'rounded-card', // Custom class for rounded alert box
        confirmButton: 'add-btn', // Blue "Add" button
        cancelButton: 'cancel-btn' // Gray "Cancel" button
      },

      willOpen: () => {
        // Apply Tailwind styles dynamically
        document.querySelector('.rounded-card')?.classList.add('rounded-xl', 'p-5', 'dark:dark:bg-tileBlack');

        document.querySelector('.add-btn')?.classList.add(
          'bg-blue-500', 'text-white', 'rounded-lg', 'px-4', 'py-2', 'text-sm',
          'hover:bg-blue-600', 'transition', 'w-24'
        );

        document.querySelector('.cancel-btn')?.classList.add(
          'bg-gray-500', 'text-white', 'rounded-lg', 'px-4', 'py-2', 'text-sm',
          'hover:bg-gray-600', 'transition', 'w-24'
        );
      }
    }).then((result) => {
      if (result.isConfirmed) { // If "Add" is clicked
        const applicationName = (document.getElementById('appName') as HTMLInputElement)?.value.trim();

        if (applicationName) {
          this.complaintSrv.addNewApplication(applicationName).subscribe(
            response => {
              Swal.fire('Success!', 'Application added successfully.', 'success').then(() => {
                window.location.reload();
              });
            },
            error => {
              Swal.fire('Error!', 'There was an error adding the application.', 'error');
            }
          );
        } else {
          Swal.fire('Error!', 'You must enter an application name.', 'error');
        }
      }
    });
  }





  editApp(systemAppId: number) {
    Swal.fire({
      html: `
      <div>
        <h1 class="mb-8 font-semibold text-black dark:text-textDark">Edit Application Name</h1>
        <div class="flex items-center gap-4">
          <label for="appName" class="whitespace-nowrap text-base dark:text-textDark">Application Name</label>
          <input id="appName" type="text" 
                 class="text-sm rounded-lg p-3 w-full max-w-xs border h-10 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400" />
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Edit', // "Edit" (Blue) second
      cancelButtonText: 'Cancel', // "Cancel" (Gray) first
      reverseButtons: true, // Keeps cancel button first

      customClass: {
        popup: 'rounded-card', // Custom class for rounded alert box
        confirmButton: 'edit-btn', // Blue "Edit" button
        cancelButton: 'cancel-btn' // Gray "Cancel" button
      },

      willOpen: () => {
        // Apply Tailwind styles dynamically
        document.querySelector('.rounded-card')?.classList.add('rounded-xl', 'p-5', 'dark:dark:bg-tileBlack');

        document.querySelector('.edit-btn')?.classList.add(
          'bg-blue-500', 'text-white', 'rounded-lg', 'px-4', 'py-2', 'text-sm',
          'hover:bg-blue-600', 'transition', 'w-24'
        );

        document.querySelector('.cancel-btn')?.classList.add(
          'bg-gray-500', 'text-white', 'rounded-lg', 'px-4', 'py-2', 'text-sm',
          'hover:bg-gray-600', 'transition', 'w-24'
        );
      }
    }).then((result) => {
      if (result.isConfirmed) { // If "Edit" is clicked
        const applicationName = (document.getElementById('appName') as HTMLInputElement)?.value.trim();

        // Input validation
        if (!applicationName) {
          Swal.fire('Error!', 'You must enter an application name.', 'error');
          return;
        }
        if (!/^[A-Za-z\s]+$/.test(applicationName)) {
          Swal.fire('Error!', 'Only letters and spaces are allowed!', 'error');
          return;
        }

        // Call your service method here with both systemAppId and applicationName
        this.complaintSrv.editApplication(systemAppId, applicationName).subscribe(
          response => {
            Swal.fire('Success!', 'Application Name edited successfully.', 'success').then(() => {
              window.location.reload();
            });
          },
          error => {
            Swal.fire('Error!', 'There was an error editing the Application Name.', 'error');
          }
        );
      }
    });
  }

  deleteApp(systemAppId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this application. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true, // Keeps cancel button first
      customClass: {
        confirmButton: 'delete-btn', // Red "Delete" button
        cancelButton: 'cancel-btn' // Gray "Cancel" button
      },
      willOpen: () => {
        // Apply Tailwind styles dynamically
        document.querySelector('.delete-btn')?.classList.add(
          'bg-red-500', 'text-white', 'rounded-lg', 'px-4', 'py-2', 'text-sm',
          'hover:bg-red-600', 'transition', 'w-24'
        );

        document.querySelector('.cancel-btn')?.classList.add(
          'bg-gray-500', 'text-white', 'rounded-lg', 'px-4', 'py-2', 'text-sm',
          'hover:bg-gray-600', 'transition', 'w-24'
        );
      }
    }).then((result) => {
      if (result.isConfirmed) { // If "Delete" is clicked
        this.complaintSrv.deleteApplicationById(systemAppId).subscribe(
          (res: any) => {
            console.log(res);

            let htmlContent = '';

            // Check if the result indicates a successful deletion
            if (res.message === 'application not found') {
              // If the application was not found
              htmlContent = `<p style="font-size: 18px; text-align: center;">Application could not be deleted. It was not found.</p>`;
              Swal.fire({
                title: 'Error',
                html: htmlContent,
                icon: 'error',
                showConfirmButton: true
              });
            } else {
              // If deletion was successful
              htmlContent = `<p style="font-size: 18px; text-align: center;">Application successfully deleted.</p>`;
              Swal.fire({
                title: 'Success',
                html: htmlContent,
                icon: 'success',
                showConfirmButton: true
              }).then(() => {
                // Reload the page after confirmation
                window.location.reload();
              });
            }
          },
          (error) => {
            // In case of an error from the backend
            console.error(error);
            Swal.fire({
              title: 'Error',
              text: 'There was an issue deleting the application.',
              icon: 'error',
              showConfirmButton: true
            });
          }
        );
      }
    });
  }

  goBack() {
    this.router.navigate(['/complaints']);
  }

  EditCategoris(id:number) {
    this.router.navigate([`/complaints/manage-complaints-categories/${id}`]);
  }

}



class SystemApplications {
  categoryCount!: number
  systemAppId!: number
  systemAppName!: string
}
