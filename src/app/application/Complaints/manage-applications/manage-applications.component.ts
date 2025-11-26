import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { DropdownModule } from "primeng/dropdown";

import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { PermissionService } from "../../../services/roles-permission/permission.service";


@Component({
  selector: "app-manage-applications",
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './manage-applications.component.html',
  styleUrl: './manage-applications.component.css'
})
export class ManageApplicationsComponent {
  systemApplicationsArr!: SystemApplications[];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    public tokenService: TokenService,
    private complaintSrv: ComplaintsService,
    public permissionService: PermissionService

  ) { }

  ngOnInit(): void {
    this.fetchAllSystemApplications();
  }

  fetchAllSystemApplications() {
    this.isLoading = true;
    this.complaintSrv.getAllSystemApplications().subscribe(
      (res) => {
        this.systemApplicationsArr = res;
        this.isLoading = false;
      },
      (error) => {
      },
    );
  }

  showAlert(systemAppId: number) {

    this.complaintSrv
      .getComplainCategoriesByAppId(systemAppId)
      .subscribe((res: any) => {

        let htmlContent = "";

        if (res.length === 0) {
          htmlContent = `<p class="swal-content">No any complaint categories added.</p>`;
        } else {
          const categoryList = res
            .map(
              (x: any, index: number) =>
                `<tr><td class="font-bold text-center">${index + 1}.</td><td class="text-start">${x.categoryEnglish}</td></tr>`,
            )
            .join("");

          htmlContent = `<table class="swal-table w-full">${categoryList}</table>`;
        }

        Swal.fire({
          title: "Plant Care Complaint Categories",
          html: htmlContent,
          showConfirmButton: false,
          didOpen: () => {
            const swalPopup = document.querySelector(
              ".swal2-popup",
            ) as HTMLElement;
            if (swalPopup) {
              swalPopup.classList.add(
                "bg-gray-100",
                "rounded-lg",
                "shadow-lg",
                "p-6",
                "w-[400px]",
                "dark:dark:bg-tileBlack",
              );
            }

            const swalTitle = document.querySelector(
              ".swal2-title",
            ) as HTMLElement;
            if (swalTitle) {
              swalTitle.classList.add(
                "text-lg",
                "font-semibold",
                "text-gray-800",
                "dark:text-textDark",
              );
            }

            const swalContent = document.querySelector(
              ".swal-content",
            ) as HTMLElement;
            if (swalContent) {
              swalContent.classList.add(
                "text-gray-600",
                "text-center",
                "text-lg",
                "dark:text-textDark",
              );
            }

            const swalTable = document.querySelector(
              ".swal-table",
            ) as HTMLElement;
            if (swalTable) {
              swalTable.classList.add(
                "border-collapse",
                "text-lg",
                "w-full",
                "dark:text-textDark",
              );
            }

            const tableRows = document.querySelectorAll(".swal-table tr");
            tableRows.forEach((row) => {
              row.classList.add("border-b", "border-gray-300", "p-2");
            });

            const tableCells = document.querySelectorAll(".swal-table td");
            tableCells.forEach((cell) => {
              cell.classList.add(
                "px-4",
                "py-2",
                "text-gray-700",
                "dark:text-textDark",
              );
            });
          },
        });
      });
  }

  addNewApp() {
    Swal.fire({
      html: `
      <div>
        <h1 class="mb-8 font-semibold text-black dark:text-textDark">Add New Application</h1>
        <div class="flex items-center gap-4">
          <label for="appName" class="whitespace-nowrap text-base dark:text-textDark">Application Name</label>
     <input id="appName" type="text"
       oninput="this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1); if(this.value.startsWith(' ')){this.value = ''}"
       class="text-sm rounded-lg p-3 w-full max-w-xs border h-10 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400" />

        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      reverseButtons: true,

      customClass: {
        popup: "rounded-card",
        confirmButton: "add-btn",
        cancelButton: "cancel-btn",
      },

      didRender: () => {
        const popup = document.querySelector(".rounded-card");
        if (popup) {
          popup.classList.add("rounded-xl", "p-5", "dark:bg-tileBlack");
        }

        const addBtn = document.querySelector(".add-btn");
        if (addBtn) {
          addBtn.classList.add(
            "bg-blue-500",
            "text-white",
            "rounded-lg",
            "px-4",
            "py-2",
            "text-sm",
            "hover:bg-blue-600",
            "transition",
            "w-24"
          );
        }

        const cancelBtn = document.querySelector(".cancel-btn");
        if (cancelBtn) {
          cancelBtn.classList.add(
            "bg-gray-500",
            "text-white",
            "rounded-lg",
            "px-4",
            "py-2",
            "text-sm",
            "hover:bg-gray-600",
            "transition",
            "w-24"
          );
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const applicationName = (document.getElementById("appName") as HTMLInputElement)?.value.trim();

        if (applicationName) {
          this.complaintSrv.addNewApplication(applicationName).subscribe(
            () => {
              Swal.fire("Success!", "Application added successfully.", "success").then(() => {
                window.location.reload();
              });
            },
            () => {
              Swal.fire("Error!", "Application name already exists.", "error");
            }
          );
        } else {
          Swal.fire("Error!", "You must enter an application name.", "error");
        }
      }
    });
  }

  editApp(systemAppId: number, systemAppName: string) {
    Swal.fire({
      html: `
      <div>
        <h1 class="mb-5 font-semibold text-black dark:text-textDark">Edit Application Name</h1>
        <div class="flex items-center gap-4">
          <label for="appName" class="whitespace-nowrap text-base dark:text-textDark">Application Name</label>
          <input id="appName" type="text" value="${systemAppName}"
            class="text-sm rounded-lg p-3 w-full max-w-xs border h-10 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400" />
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Edit",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-xl p-5 dark:bg-tileBlack",
        confirmButton: "bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600 transition w-24",
        cancelButton: "bg-gray-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-600 transition w-24"
      },
      didRender: () => {
        const popup = document.querySelector(".swal2-popup");
        if (popup) popup.classList.add("rounded-xl", "p-5", "dark:bg-tileBlack");
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const inputElement = document.getElementById("appName") as HTMLInputElement;
        const applicationName = inputElement?.value.trim();

        if (!applicationName) {
          Swal.fire("Error!", "Application name cannot be empty!", "error");
          return;
        }

        if (!/^[A-Za-z\s]+$/.test(applicationName)) {
          Swal.fire("Error!", "Only letters and spaces are allowed!", "error");
          return;
        }

        this.complaintSrv.editApplication(systemAppId, applicationName).subscribe({
          next: () => {
            Swal.fire("Success!", "Application name updated successfully.", "success").then(() => {
              window.location.reload();
            });
          },
          error: (err) => {
            console.error("Error updating app name:", err);
            Swal.fire("Error!", "Already exists", "error");
          }
        });
      }
    });
  }

  deleteApp(systemAppId: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this application. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "delete-btn",
        cancelButton: "cancel-btn",
      },
      willOpen: () => {
        document
          .querySelector(".delete-btn")
          ?.classList.add(
            "bg-red-500",
            "text-white",
            "rounded-lg",
            "px-4",
            "py-2",
            "text-sm",
            "hover:bg-red-600",
            "transition",
            "w-24",
          );

        document
          .querySelector(".cancel-btn")
          ?.classList.add(
            "bg-gray-500",
            "text-white",
            "rounded-lg",
            "px-4",
            "py-2",
            "text-sm",
            "hover:bg-gray-600",
            "transition",
            "w-24",
          );
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.complaintSrv.deleteApplicationById(systemAppId).subscribe(
          (res: any) => {

            let htmlContent = "";

            if (res.message === "application not found") {
              htmlContent = `<p style="font-size: 18px; text-align: center;">Application could not be deleted. It was not found.</p>`;
              Swal.fire({
                title: "Error",
                html: htmlContent,
                icon: "error",
                showConfirmButton: true,
              });
            } else {
              htmlContent = `<p style="font-size: 18px; text-align: center;">Application successfully deleted.</p>`;
              Swal.fire({
                title: "Success",
                html: htmlContent,
                icon: "success",
                showConfirmButton: true,
              }).then(() => {
                window.location.reload();
              });
            }
          },
          (error) => {
            console.error(error);
            Swal.fire({
              title: "Error",
              text: "There was an issue deleting the application.",
              icon: "error",
              showConfirmButton: true,
            });
          },
        );
      }
    });
  }

  goBack() {
    this.router.navigate(["/complaints"]);
  }

  EditCategoris(id: number) {
    this.router.navigate([`/complaints/manage-complaints-categories/${id}`]);
  }

  navigationPath(path: string) {
    this.router.navigate([path]);
  }
}

class SystemApplications {
  categoryCount!: number;
  systemAppId!: number;
  systemAppName!: string;
  modifiedBy!: string | null;
}
