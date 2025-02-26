import { Component, OnInit } from '@angular/core';
import { ComplaintsService } from '../../../services/complaints/complaints.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-manage-complaints-categories',
  standalone: true,
  imports: [CommonModule,FormsModule, LoadingSpinnerComponent],
  templateUrl: './manage-complaints-categories.component.html',
  styleUrl: './manage-complaints-categories.component.css'
})
export class ManageComplaintsCategoriesComponent implements OnInit {
  categoriesArr:Categories[] = []

  appId!: number
  isLoading:boolean = true;

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
    this.isLoading=true
    this.complaintSrv.getComplainCategoriesByAppId(this.appId).subscribe(
      (res) => {
        console.log(res);
        
        this.categoriesArr = res
        this.isLoading=false;
      }
    )
  }

  editComplain(id:number){
    this.router.navigate([`/complaints/edit-complaint-categories/${id}`])
  }

  navigationPath(path: string) {
    this.router.navigate([path])
  }

}

class Categories {
  id!: number;
  categoryEnglish!: string;
}
