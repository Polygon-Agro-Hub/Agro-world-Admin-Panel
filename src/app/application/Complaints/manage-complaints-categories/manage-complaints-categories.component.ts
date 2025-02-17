import { Component, OnInit } from '@angular/core';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-complaints-categories',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './manage-complaints-categories.component.html',
  styleUrl: './manage-complaints-categories.component.css'
})
export class ManageComplaintsCategoriesComponent implements OnInit {
  categoriesArr:Categories[] = []

  appId!: number

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private complaintSrv: ComplaintsService
  ) { }

  ngOnInit(): void {
    this.appId = this.route.snapshot.params['id']
    this.fetchCategories()
  }

  fetchCategories() {
    this.complaintSrv.getComplainCategoriesByAppId(this.appId).subscribe(
      (res) => {
        console.log(res);
        
        this.categoriesArr = res
      }
    )
  }

  editComplain(id:number){
    this.router.navigate([`/admin/complaints/edit-complaint-categories/${id}`])
  }

}

class Categories {
  id!: number;
  categoryEnglish!: string;
}
