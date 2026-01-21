import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from '../../../../services/finance/finance.service';
import { PersonalInfoTabComponent } from '../personal-info-tab/personal-info-tab.component';
import { IdProofTabComponent } from '../id-proof-tab/id-proof-tab.component';
import { FinanceInfoTabComponent } from '../finance-info-tab/finance-info-tab.component';
import { LandInfoTabComponent } from '../land-info-tab/land-info-tab.component';
import { InvestmentInfoTabComponent } from '../investment-info-tab/investment-info-tab.component';
import { CultivationInfoTabComponent } from '../cultivation-info-tab/cultivation-info-tab.component';
import { CroppingSystemTabComponent } from '../cropping-system-tab/cropping-system-tab.component';
import { ProfitRiskTabComponent } from '../profit-risk-tab/profit-risk-tab.component';
import { EconomicalTabComponent } from '../economical-tab/economical-tab.component';
import { LabourTabComponent } from '../labour-tab/labour-tab.component';
import { HarvestStorageTabComponent } from '../harvest-storage-tab/harvest-storage-tab.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-audit-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    PersonalInfoTabComponent,
    IdProofTabComponent,
    FinanceInfoTabComponent,
    LandInfoTabComponent,
    InvestmentInfoTabComponent,
    CultivationInfoTabComponent,
    CroppingSystemTabComponent,
    ProfitRiskTabComponent,
    EconomicalTabComponent,
    LabourTabComponent,
    HarvestStorageTabComponent,
    FormsModule,
  ],
  templateUrl: './audit-personal-info.component.html',
  styleUrl: './audit-personal-info.component.css',
})
export class AuditPersonalInfoComponent implements OnInit {
  isLoading: boolean = false;
  activeTab: string = 'Personal';
  inspectionArray!: Inspection;
  reqId!: number;
  approvePopUpOpen: boolean = false;
  rejectPopUpOpen: boolean = false;
  rejectReason: string = '';
  openDevideSharesPopUp: boolean = false;

  numShares!: number;
  shareValue: number = 0.0;
  minimumShare!: number;
  maximumShare!: number;

  sharesData: Partial<Shares> = {};
  devideRequestObj: Partial<DevideRequest> = {};
  lastSegment!: string;

  constructor(
    private financeService: FinanceService,
    private router: Router,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {

    const requestId = this.route.snapshot.paramMap.get('requestId');
    console.log(requestId);
    this.reqId = Number(requestId);

    const segments = this.route.snapshot.url;
    this.lastSegment = segments[segments.length - 2]?.path;

    console.log('Last route part:', this.lastSegment);

    this.fetchData();
  }

  back(): void {
    window.history.back();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;
  }

  fetchData() {
    this.isLoading = true;
    this.financeService
      .getInspectionDetails(this.reqId)
      .subscribe((res: any) => {
        this.inspectionArray = res.data;
        this.sharesData = res.shares;
        console.log('sharesData', this.sharesData);
        console.log(res.data);

        if (this.sharesData.devideData) {
          this.minimumShare = this.sharesData.devideData.minShare;
          this.maximumShare = this.sharesData.devideData.maxShare;
          this.numShares = this.sharesData.devideData.defineShares;
          this.shareValue = Number(this.sharesData.totalValue) / this.numShares;
        }

        console.log('--------------------------------------');

        console.log(res.shares.divideData);

        this.isLoading = false;
      });
  }

  onNumSharesChange(value: number) {
    this.numShares = value; // optional, ngModel already does this
    console.log('numShares', this.numShares);
    if (this.numShares !== null) {
      this.shareValue = Number(this.sharesData.totalValue) / this.numShares;
    } else if (this.numShares === null) {
      this.shareValue = 0.0;
    }
    console.log('shareValue', this.shareValue);
  }

  openApprovePopUp() {
    this.approvePopUpOpen = true;
  }

  openRejectPopUp() {
    this.rejectPopUpOpen = true;
  }

  cancelApprovePopUp() {
    this.approvePopUpOpen = false;
  }

  cancelRejectPopUp() {
    this.rejectPopUpOpen = false;
  }

  ApproveRequest() {
    this.financeService.approveRequest(this.reqId).subscribe(
      (res)=>{
        if(res.status){
          Swal.fire({
            title: 'Success',
            text: `Request Approved Successfully`,
            icon: 'success',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.router.navigate(['/finance/action/finance-govicapital/viewAll-Govicare-AuditedRequests']);
        }else if(!res.status){ 
          Swal.fire({
            title: 'error',
            text: `Failed to Approve the Request`,
            icon: 'error',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      }
    )
    // this.openDevideSharesPopUp = true;
  }

  RejectRequest() {
    this.rejectPopUpOpen = false;

    this.isLoading = true;

    this.financeService
      .rejectRequest(this.sharesData.id!, this.rejectReason)
      .subscribe((res: any) => {
        if (res.status) {
          Swal.fire({
            title: 'Success',
            text: `Request Rejected Successfully`,
            icon: 'success',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        } else if (!res.status) {
          Swal.fire({
            title: 'error',
            text: `Failed to Reject the Request`,
            icon: 'error',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
        this.isLoading = false;
      });
  }

  cancelDevidePopUp() {
    this.openDevideSharesPopUp = false;
  }

  DevideRequest(form: any) {

    console.log('devind')

    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    this.openDevideSharesPopUp = false;

    this.isLoading = true;


    this.devideRequestObj.totalValue = this.sharesData.totalValue;
    this.devideRequestObj.numShares = this.numShares;
    this.devideRequestObj.shareValue = Number(this.shareValue.toFixed(2));
    this.devideRequestObj.minimumShare = this.minimumShare;
    this.devideRequestObj.maximumShare = this.maximumShare;
    this.devideRequestObj.id = this.sharesData.id;
    this.devideRequestObj.jobId = this.sharesData.jobId;
    this.devideRequestObj.reqCahangeTime = this.sharesData.reqCahangeTime;
    this.devideRequestObj.empId = this.sharesData.empId;
    console.log('devideRequestObj', this.devideRequestObj);

    this.financeService.devideSharesRequest(this.devideRequestObj).subscribe((res: any) => {

      if (res.status) {
        Swal.fire({
          title: 'Success',
          text: `Request Approved Successfully`,
          icon: 'success',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      } else if (!res.status) {
        Swal.fire({
          title: 'error',
          text: `Failed to Approve the Request`,
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
      this.isLoading = false;
    })
  }

  allowDecimalOnly(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    const key = event.key;

    // Block everything except numbers and dot
    if (!allowedKeys.includes(key)) {
      event.preventDefault();
      return;
    }

    // Prevent multiple dots
    if (key === '.' && (event.target as HTMLInputElement).value.includes('.')) {
      event.preventDefault();
    }
  }

  devideSharesPopUp(devideType: 'Create' | 'Edit') {
    this.openDevideSharesPopUp = true;
    this.devideRequestObj.devideType = devideType;
  }

  editSharesPopUp() {

  }

}

interface Inspection {
  Personal: IPersonal;
  ID: IIdInfo;
  Finance: IFinance;
  Land: ILand;
  Investment: IInvestment;
  Cultivation: ICultivation;
  Cropping: ICropping;
  ProfitRisk: IProfitRisk;
  Economical: IEconomical;
  Labor: ILabor;
  Harvest: IHarvest;
}

interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
}

class Shares {
  id!: number;
  reqCahangeTime!: Date;
  jobId!: string;
  farmerPhone!: string;
  empId!: string;
  officerPhone!: string;
  totalValue: string = '';
  devideData: DevideData | null = null;
}

class DevideData {
  totValue!: number
  defineShares!: number
  maxShare!: number
  minShare!: number
}

class DevideRequest {
  id!: number;
  jobId!: string;
  reqCahangeTime!: Date;
  empId!: string;
  totalValue!: string;
  numShares!: number;
  shareValue!: number;
  minimumShare!: number;
  maximumShare!: number;
  devideType: 'Create' | 'Edit' = 'Create';
}

interface IPersonal {
  firstName: string;
  lastName: string;
  otherName: string;
  callName: string;
  phone1: string;
  phone2: string;
  familyPhone: string;
  landHome: string;
  landWork: string;
  email1: string;
  email2: string;
  house: string;
  street: string;
  city: string;
  country: string;
  district: string;
  province: string;
}

interface ILand {
  isOwnByFarmer: string | null;
  ownershipStatus: string;
  landDiscription: string;
  longitude: string;
  latitude: string;
  images: string | null;
  createdAt: string;
}

interface IInvestment {
  expected: string;
  purpose: string;
  repaymentMonth: number;
  createdAt: string;
}


interface IIdInfo {
  pType: string;
  pNumber: string;
  frontImg: string;
  backImg: string;
}

interface IFinance {
  accHolder: string;
  accNum: string;
  bank: string;
  branch: string;
  debtsOfFarmer: string;
  noOfDependents: number;
  assetsLand: { Land: string[] };
  assetsBuilding: { Building: string[] };
  assetsVehicle: { Vehicle: string[] };
  assetsMachinery: { Machinery: string[] };
  assetsFarmTool: string;
}

interface ICropping {
  opportunity: string[];
  otherOpportunity: string;
  hasKnowlage: number;
  prevExperince: string;
  opinion: string;
}

interface IProfitRisk {
  id: number
  reqId: string
  profit: number
  isProfitable: number
  isRisk: number
  risk: string
  solution: string
  manageRisk: string
  worthToTakeRisk: string
  createdAt: Date
}

interface IEconomical {
  id: number
  reqId: string
  isSuitaleSize: number
  isFinanceResource: number
  isAltRoutes: number
  createdAt: Date
}

interface IHarvest {
  id: number
  reqId: string
  hasOwnStorage: number
  hasPrimaryProcessingAccess: number
  ifNotHasFacilityAccess: number
  knowsValueAdditionTech: number
  hasValueAddedMarketLinkage: number
  awareOfQualityStandards: number
  createdAt: Date
}

interface ILabor {
  id: number
  reqId: string
  isManageFamilyLabour: number
  isFamilyHiredLabourEquipped: number
  hasAdequateAlternativeLabour: number
  areThereMechanizationOptions: number
  isMachineryAvailable: number
  isMachineryAffordable: number
  isMachineryCostEffective: number
  createdAt: Date
}

export interface ICultivation {
  temperature: number;
  rainfall: number;
  sunShine: number;
  humidity: number;
  windVelocity: number;
  windDirection: number;
  zone: number;
  isCropSuitale: number;
  ph: number;
  soilType: string;
  soilfertility: string;
  waterSources: string[];
  waterImage: string[];
  isRecevieRainFall: number;
  isRainFallSuitableCrop: number;
  isRainFallSuitableCultivation: number;
  isElectrocityAvailable: number;
  ispumpOrirrigation: number;
}
