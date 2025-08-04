import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-edit-complain-cagegories',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DropdownModule ],
  templateUrl: './edit-complain-cagegories.component.html',
  styleUrl: './edit-complain-cagegories.component.css'
})
export class EditComplainCagegoriesComponent implements OnInit {
  categorieId!: number
  roleArr: Roles[] = [];
  appsArr: Apps[] = [];
  complainObj: ComplainCategory = new ComplainCategory();
  isLoading:boolean = true;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private complaintSrv: ComplaintsService
  ) { }

  ngOnInit(): void {
    this.categorieId = this.route.snapshot.params['id'];
    this.fetchComplainCategory();
    this.fetchCategoriDetails();
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

  fetchCategoriDetails() {
    this.isLoading=true
    this.complaintSrv.getCategoieDetailsById(this.categorieId).subscribe(
      (res) => {
        console.log(res);
        this.complainObj = res
        this.isLoading=false
      }
    )
  }


  onSubmit() {
    console.log('Edit Obj->',this.complainObj);
    
    if (this.complainObj.appId === 0 || this.complainObj.appId === 0 || !this.complainObj.categoryEnglish || !this.complainObj.categorySinhala || !this.complainObj.categoryTamil || !this.complainObj.id) {
      Swal.fire('Warning', 'Fill all required feilds!', 'warning')
      return;
    }
    this.complaintSrv.EditComplainCategory(this.complainObj).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire("Success", 'Edit complain category success!', 'success')
          this.router.navigate(['/complaints/manage-applications'])
        } else {
          Swal.fire("Error", 'Error Occur creaating complain category!', 'error')

        }

      }
    )
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
  id!:number
  roleId!: number;
  appId!: number;
  categoryEnglish!: string
  categorySinhala!: string
  categoryTamil!: string
}
