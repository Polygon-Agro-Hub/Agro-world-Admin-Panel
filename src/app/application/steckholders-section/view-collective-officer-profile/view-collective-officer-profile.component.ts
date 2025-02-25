import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-view-collective-officer-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule,LoadingSpinnerComponent],
  templateUrl: './view-collective-officer-profile.component.html',
  styleUrl: './view-collective-officer-profile.component.css',
})
export class ViewCollectiveOfficerProfileComponent {
  officerObj: CollectionOfficer = new CollectionOfficer();
  officerId!: number;

  isLoading = false;

  constructor(private route: ActivatedRoute,private collectionService:CollectionService) {}

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['id'];
    this.fetchOfficerById(this.officerId);
  }

  fetchOfficerById(id: number){
    this.isLoading = true;
    this.collectionService.fetchAllCollectionOfficerProfile(id).subscribe((res: any)=>{
      this.isLoading = false;
      this.officerObj = res.officerData.collectionOfficer;
      console.log(this.officerObj);
    })
  }
  
}

class CollectionOfficer {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  phoneNumber01!: string;
  phoneNumber02!: string;
  phoneCode01!: string;
  phoneCode02!: string;
  image!: string;
  nic!: string;
  email!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country!: string;
  empId!: string;
  jobRole!: string;
  accHolderName!: string;
  accNumber!: string;
  bankName!: string;
  branchName!: string;
  companyNameEnglish!: string;
  centerName!: string;

}
