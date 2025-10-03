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
  companyId!: number;
  centerName: string = '';
  regCode!: string;
  selectTable: string = 'collection';
  centerId!: number;
  transCount: number = 0;
  transAmount: number = 0.0;
  totExpences: number = 0.0;
  expencePrecentage: number = 0.0;
  isLoading = false;
  Cname: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private TargetSrv: CollectionCenterService
  ) { }

  ngOnInit(): void {
    this.centerId = this.route.snapshot.params['id'];
    this.companyId = this.route.snapshot.params['comid'];
    this.centerName = this.route.snapshot.params['centerName'];
    this.Cname = this.route.snapshot.queryParams['Cname'];
    this.fetchCenterDashbordDetails();
  }

  centerOfficers(id = this.centerId) {
    this.router.navigate(
      ['/steckholders/action/collective-officer'],
      { queryParams: { id } }
    );
  }

  fetchCenterDashbordDetails() {
    this.isLoading = true;
    this.TargetSrv.getDashbordDetails(this.centerId).subscribe((res) => {
      this.isLoading = false;

      this.centerNameObj = res.officerCount;
      this.transCount = res.transCount.transactionCount;
      this.transAmount = res.transAmountCount.transAmountCount
      this.totExpences = res.totExpences.totExpences ?? 0;
      this.expencePrecentage = res.difExpences;
      this.resentCollectionArr = res.limitedResentCollection
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
      `/collection-hub/add-daily-target/${this.centerId}/${this.Cname}/${this.centerName}`,
    ]);
  }

  navigateToCollectionHub() {
    this.router.navigate([`/collection-hub/agro-world-centers`]);
  }


  navigateToMarketPrice() {
    this.router.navigate([
      `collection-hub/agro-world-center-price/${this.centerId}/${this.companyId}/${this.centerName}`,
    ]);
  }

  navigateToTarget() {
    this.router.navigate([`collection-hub/view-current-centre-target/${this.centerId}`]); // Replace with your actual route
  }

  navigateCollectionExpenses() {
    this.router.navigate([`collection-hub/center-collection-expense/${this.centerId}`]);
  }

  viewCenterOfficers() {
    this.router.navigate(['collection-hub/view-center-officers'], {
      queryParams: { id: this.centerId, Cname: this.Cname }
    });
  }
}

class CenterName {
  id!: number;
  centerName!: string;
  regCode!: string;
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
