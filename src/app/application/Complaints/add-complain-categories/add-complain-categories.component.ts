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

  onSubmit(){
    if(this.complainObj.appId === 0 || this.complainObj.appId === 0 || !this.complainObj.categoryEnglish || !this.complainObj.categorySinhala || !this.complainObj.categoryTamil){
      Swal.fire('Warning','Fill all required feilds!', 'warning')
      return;
    }
    this.complaintSrv.AddNewComplainCategory(this.complainObj).subscribe(
      (res)=>{
        if(res.status){
          Swal.fire("Success",'Create complain category success!','success')
          this.router.navigate(['/complaints/manage-applications'])
        }else{
          Swal.fire("Error",'Error Occur creaating complain category!','error')

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
