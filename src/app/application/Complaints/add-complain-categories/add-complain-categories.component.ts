import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-complain-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
