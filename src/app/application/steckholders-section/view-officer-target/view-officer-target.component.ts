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

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Exceeded', value: 'Exceeded' },
  ];

  constructor(
    private TargetSrv: OfficerTargetService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['officerId'];
    this.fetchSelectedOfficerTarget(this.officerId, this.searchText);
  }

  fetchSelectedOfficerTarget(
    officerId: number,
    searchQuery: string = ''
  ): void {
    this.isLoading = true;
    this.TargetSrv.getSelectedOfficerTargetData(
      officerId,
      this.selectStatus,
      searchQuery
    ).subscribe(
      (res) => {
        this.isLoading = false;
        console.log(res);

        this.selectedOfficerDataArr = res.items;
        console.log(res.items.length);

        this.hasData = res.items.length > 0;
      },
      (error) => {
        console.error('Error fetching officer target data:', error);
        this.isLoading = false;
        this.hasData = false;
      }
    );
  }

  cancelStatus() {
    this.selectStatus = '';
    this.fetchSelectedOfficerTarget(this.officerId, this.searchText);
  }

  filterStatus() {
    this.fetchSelectedOfficerTarget(this.officerId, this.searchText);
  }

  onSearch() {
    this.fetchSelectedOfficerTarget(this.officerId, this.searchText);
  }

  onSearchKeyPress(event: KeyboardEvent) {
    // Block leading spaces
    if (this.searchText && this.searchText.length === 1 && this.searchText === ' ') {
      this.searchText = '';
      return;
    }

    // Trim leading spaces
    if (this.searchText && this.searchText.startsWith(' ')) {
      this.searchText = this.searchText.trimStart();
    }

    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  offSearch() {
    this.searchText = '';
    this.fetchSelectedOfficerTarget(this.officerId, this.searchText);
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