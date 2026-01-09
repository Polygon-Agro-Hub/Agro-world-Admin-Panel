import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { Location } from '@angular/common';

class AssertReport {
  'category': string;
  'totPrice': string;
}

@Component({
  selector: 'app-report-current-asserts',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './report-current-asserts.component.html',
  styleUrl: './report-current-asserts.component.css',
})
export class ReportCurrentAssertsComponent implements OnInit {
  isLoading = false;
  userId!: string;
  name!: string;
  assertReport!: AssertReport[];
  farmId!: number;
  farmName!: string;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private assertService: AssetsService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['userId'];
    this.name = this.route.snapshot.params['name'];
    this.farmId = this.route.snapshot.params['farmId'];
    this.farmName = this.route.snapshot.params['farmName'];
    console.log("userId", this.userId);
    console.log("name", this.name);
    console.log("farmId", this.farmId);
    this.fetchCurrentAssert(this.userId,this.farmId);
  }

  fetchCurrentAssert(id: string , farmId:number): void {
    this.isLoading = true;
    this.assertService.getCurrentAssertById(id,farmId).subscribe((responce) => {
      this.isLoading = false;
      this.assertReport = responce;
    });
  }

  viewList(id: any, category: any) {
    this.router.navigate(['/plant-care/action/current-assets-view'], {
      queryParams: { id, category, fullName: this.name , farmId:this.farmId, farmName: this.farmName },
    });
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  back() {
    this.location.back();
  }
}
