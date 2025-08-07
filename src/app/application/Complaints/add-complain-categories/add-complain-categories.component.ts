import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import Swal from 'sweetalert2';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-add-complain-categories',
  standalone: true,
  imports: [CommonModule, FormsModule,DropdownModule],
  templateUrl: './add-complain-categories.component.html',
  styleUrl: './add-complain-categories.component.css'
})
export class AddComplainCategoriesComponent implements OnInit {
  roleArr: Roles[] = [];
  appsArr: Apps[] = [];
  complainObj: ComplainCategory = new ComplainCategory();


  constructor(
    private router: Router,
    private complaintSrv: ComplaintsService
  ) { }

  ngOnInit(): void {
    this.fetchComplainCategory();
  }

  fetchComplainCategory() {
    this.complaintSrv.getAdminComplainCategoryForCreate().subscribe(
      (res) => {
        console.log(res);
        
        this.roleArr = res.adminRoles;
        this.appsArr = res.systemApps;

      }
    )
  }

  onSubmit() {
    const c = this.complainObj;
    if (
      !c.appId || !c.roleId || 
      !c.categoryEnglish || !c.categorySinhala || !c.categoryTamil
    ) {
      Swal.fire('Warning', 'Fill all required fields!', 'warning');
      return;
    }
  
    this.complaintSrv.AddNewComplainCategory(c).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire("Success", 'Complaint category created successfully!', 'success');
          this.router.navigate(['/complaints/manage-applications']);
        } else {
          if (res.message === 'Category already added') {
            Swal.fire("Info", 'This complaint category already exists.', 'info');
          } else {
            Swal.fire("Error", 'Error occurred while creating complaint category!', 'error');
          }
        }
      },
      (err) => {
        Swal.fire("Error", 'Already added this category!', 'error');
      }
    );
  }
  
  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/complaints']);
    }
  });
}


    onCancel() {
      Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You may lose the added data after canceling!",
        showCancelButton: true,
        confirmButtonText: "Yes, Cancel",
        cancelButtonText: "No, Keep Editing",
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(["/complaints"]);
        }
      });
    }

blockLeadingSpace(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  // Block space key if cursor is at position 0 (start)
  if (event.key === ' ' && input.selectionStart === 0) {
    event.preventDefault();
  }
}

validateEnglish(): void {
  let value = this.complainObj.categoryEnglish || '';
  
  // Remove all characters except English letters and spaces
  value = value.replace(/[^A-Za-z ]+/g, '');

  // Also remove leading spaces just in case (e.g., from paste)
  value = value.replace(/^\s+/, '');

  this.complainObj.categoryEnglish = value;
}

  allowOnlySinhala(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[\u0D80-\u0DFF ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

allowOnlyTamil(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    if (char === ' ' && input.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    if (!/^[\u0B80-\u0BFF ]$/.test(char) && event.key.length === 1) {
      event.preventDefault();
    }
  }

  navigationPath(path: string) {
    this.router.navigate([path])
  }

}

class Roles {
  id!: number;
  role!: string
}

class Apps {
  id!: number;
  appName!: string
}

class ComplainCategory {
  roleId: number = 0;
  appId: number = 0;
  categoryEnglish!: string
  categorySinhala!: string
  categoryTamil!: string
}
