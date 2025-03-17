import { Component, Input, OnChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-collection-officer-users-row",
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: "./collection-officer-users-row.component.html",
  styleUrl: "./collection-officer-users-row.component.css",
})
export class CollectionOfficerUsersRowComponent implements OnChanges {
  @Input() thirdRow: any = {};

  centerHeadOfficers: number = 0;
  centerManagers: number = 0;
  collectionOfficers: number = 0;
  customerOfficers: number = 0;
  newOfficers: number = 0;
  allOfficers: number = 0;
  activeOfficers: number = 0;
  

  ngOnChanges(): void {
    this.fetchCollectionOfficerData(this.thirdRow);
  }

  fetchCollectionOfficerData(data: any) {
    console.log('Third Row -> ', data);
    this.centerHeadOfficers = data.jobRoleOfficerCount?.CCH?.officerCount ?? 0;
    this.centerManagers = data.jobRoleOfficerCount?.CCM?.officerCount ?? 0;
    this.collectionOfficers = data.jobRoleOfficerCount?.COO?.officerCount ?? 0;
    this.customerOfficers = data.jobRoleOfficerCount?.CUO?.officerCount ?? 0;
    this.newOfficers = data?.newOfficerCount ?? 0;
    this.allOfficers = this.totCount(this.centerHeadOfficers, this.centerManagers, this.collectionOfficers, this.customerOfficers);
    this.activeOfficers = data?.activeOfficers ?? 0;
  }


  totCount(x1: number, x2: number, x3: number, x4: number): number {
    return (x1 + x2 + x3 + x4)
  }
}
