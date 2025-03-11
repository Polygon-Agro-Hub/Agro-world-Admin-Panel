import { Component } from '@angular/core';
import { OfficerTargetService } from '../../../services/collection-officer/officer-target.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-officer-target',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './view-officer-target.component.html',
  styleUrl: './view-officer-target.component.css',
})
export class ViewOfficerTargetComponent {
  officerId!: number;

  selectedOfficerDataArr!: SelectedOfficerTarget[];

  hasData: boolean = true;
  selectStatus: string = '';
  searchText: string = '';
  isLoading = false;

  constructor(
    private TargetSrv: OfficerTargetService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  ngOnInit(): void{
    this.officerId = this.route.snapshot.params['officerId'];
    this.fetchSelectedOfficerTarget(this.officerId);
  }

  // fetchSelectedOfficerTarget(
  //   officerId: number,
  //   status: string = this.selectStatus,
  //   search: string = this.searchText
  // ) {
  //   this.TargetSrv.getSelectedOfficerTargetData(
  //     officerId,
  //     status,
  //     search
  //   ).subscribe((res) => {
  //     console.log(res);

  //     this.selectedOfficerDataArr = res.items;
  //     console.log(res.items.length);
  //     if (res.items.length === 0) {
  //       this.hasData = false;
  //     } else {
  //       this.hasData = true;
  //     }
  //   });
  // }

  fetchSelectedOfficerTarget(officerId: number): void {
    this.isLoading = true;
    this.TargetSrv.getSelectedOfficerTargetData(officerId).subscribe(
        (res) => {
          this.isLoading = false;
            console.log(res);

            this.selectedOfficerDataArr = res.items;
            console.log(res.items.length);

            // Check if there is data
            if (res.items.length === 0) {
                this.hasData = false;
            } else {
                this.hasData = true;
            }
        },
        (error) => {
            console.error("Error fetching officer target data:", error);
            this.hasData = false; // Assume no data in case of an error
        }
    );
}

  // cancelStatus() {
  //   this.selectStatus = '';
  //   this.fetchSelectedOfficerTarget(this.officerId, this.selectStatus, this.searchText);
  // }

  cancelStatus() {
    this.selectStatus = '';
    this.fetchSelectedOfficerTarget(this.officerId);
  }

  // filterStatus() {
  //   this.fetchSelectedOfficerTarget(this.officerId, this.selectStatus, this.searchText);
  // }

  filterStatus() {
    this.fetchSelectedOfficerTarget(this.officerId);
  }

  // onSearch() {
  //   this.fetchSelectedOfficerTarget(this.officerId, this.selectStatus, this.searchText);
  // }

  onSearch() {
    this.fetchSelectedOfficerTarget(this.officerId);
  }

  // offSearch() {
  //   this.searchText = '';
  //   this.fetchSelectedOfficerTarget(this.officerId, this.selectStatus, this.searchText);
  // }

  offSearch() {
    this.searchText = '';
    this.fetchSelectedOfficerTarget(this.officerId);
  }
}

class SelectedOfficerTarget {
  id!: number;
  dailyTargetId!: number;
  varietyNameEnglish!: string;
  cropNameEnglish!: string;
  target!: number;
  grade!: string;
  complete!: string;
  toDate!: Date;
  toTime!: string;
  empId!: string;
  status!: string;
  remaining!: number;
}
