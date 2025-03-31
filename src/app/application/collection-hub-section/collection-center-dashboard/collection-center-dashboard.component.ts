import { Component } from '@angular/core';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-collection-center-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './collection-center-dashboard.component.html',
  styleUrl: './collection-center-dashboard.component.css',
})
export class CollectionCenterDashboardComponent {
  centerNameObj: CenterName = new CenterName();
  resentCollectionArr!: ResentCollection[];
  companyId!: number
  centerName: string = '';

  selectTable: string = 'collection';
  centerId!: number;
  transCount: number = 0;
  transAmount: number = 0.0;
  totExpences: number = 0.0;
  expencePrecentage: number = -22.0;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private TargetSrv: CollectionCenterService
  ) { }

  ngOnInit(): void {
    this.centerId = this.route.snapshot.params['id'];
    this.companyId = this.route.snapshot.params['comid'];
    this.centerName = this.route.snapshot.params['centerName'];
    this.fetchCenterDashbordDetails();
  }

  fetchCenterDashbordDetails() {
    this.isLoading = true;
    this.TargetSrv.getDashbordDetails(this.centerId).subscribe((res) => {
      console.log(res);
      this.isLoading = false;
      
      this.centerNameObj = res.officerCount;
      this.transCount = res.transCount.transactionCount;
      this.transAmount = res.transAmountCount.transAmountCount;
      this.resentCollectionArr = res.limitedResentCollection;
      this.totExpences = res.totExpences.totExpences;
      this.expencePrecentage = res.difExpences;
      this.isLoading = false;
    });
  }

  chooseTable(table: string) {
    this.selectTable = table;
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  navigateAddTarget() {
    this.router.navigate([
      `/collection-hub/add-daily-target/${this.centerId}/${this.centerNameObj.centerName}/${this.companyId}`,
    ]);
  }

  navigateToMarketPrice() {
    this.router.navigate([`collection-hub/agro-world-center-price/${this.centerId}/${this.companyId}/${this.centerName}`]);
  }
}

class CenterName {
  id!: number;
  centerName!: string;
  officerCount!: number;
}

class ResentCollection {
  cropNameEnglish!: string;
  varietyNameEnglish!: string;
  totPrice!: string;
  totQty!: string;
  grade!: string;
  date!: Date;
}
