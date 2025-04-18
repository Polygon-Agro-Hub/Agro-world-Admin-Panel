import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-edit-complain-cagegories',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
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
    this.fetchComplainCategory();
    this.fetchCategoriDetails();
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
