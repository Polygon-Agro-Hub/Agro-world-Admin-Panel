import { Component, Input, OnChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: "app-collection-officer-users-row",
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: "./collection-officer-users-row.component.html",
  styleUrl: "./collection-officer-users-row.component.css",
})
export class CollectionOfficerUsersRowComponent implements OnChanges {
  @Input() thirdRow: any = {};

  centerHeadOfficers!: number;
  centerManagers!: number;
  collectionOfficers!: number;
  customerOfficers!: number;
  newOfficers!: number;
  allOfficers!: number;
  activeOfficers!: number;

  ngOnChanges(): void {
    this.fetchCollectionOfficerData(this.thirdRow);
  }

  fetchCollectionOfficerData(data: any) {
    console.log('Third Row -> ', data);
    this.centerHeadOfficers = data.jobRoleOfficerCount.CCH.officerCount ?? 0;
    this.centerManagers = data.jobRoleOfficerCount.CCM.officerCount ?? 0;
    this.collectionOfficers = data.jobRoleOfficerCount.COO.officerCount ?? 0;
    this.customerOfficers = data.jobRoleOfficerCount.CUO.officerCount ?? 0;
    this.newOfficers = data.newOfficerCount ?? 0;
    this.allOfficers = this.totCount(this.centerHeadOfficers, this.centerManagers, this.collectionOfficers, this.customerOfficers);
    this.activeOfficers = data.activeOfficers ?? 0;
  }


  totCount(x1: number, x2: number, x3: number, x4: number): number {
    return (x1 + x2 + x3 + x4)
  }
}
