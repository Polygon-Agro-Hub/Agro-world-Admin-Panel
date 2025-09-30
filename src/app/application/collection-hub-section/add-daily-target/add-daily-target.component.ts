import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignCenterTargetComponent } from '../assign-center-target/assign-center-target.component';
import { SelectVarietyListComponent } from '../select-variety-list/select-variety-list.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-daily-target',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AssignCenterTargetComponent,
    SelectVarietyListComponent,
  ],
  templateUrl: './add-daily-target.component.html',
  styleUrl: './add-daily-target.component.css',
})
export class AddDailyTargetComponent {
  isAssignTarget: boolean = true;
  isVariety: boolean = false;
  centerId!: number;
  centerName!: string;

  dailyTartgetObj: DailyTarget = new DailyTarget();

  isVerityVisible = true;
  isAddColumn = false;
  selectCropId: number | string = '';

  totalTime = 300;
  remainingTime = this.totalTime;
  intervalId: any;
  progress = 283;

  isSaveButtonDisabled = false;
  iscountDown = true;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.dailyTartgetObj.centerId = this.route.snapshot.params['id'];
    this.dailyTartgetObj.centerName = this.route.snapshot.params['name'];
    this.dailyTartgetObj.regCode = this.route.snapshot.params['regCode'];
  }

  selectAssignTarget() {
    this.isAssignTarget = true;
    this.isVariety = false;
  }

  selectVariety() {
    this.isAssignTarget = false;
    this.isVariety = true;
  }

  back(): void {
    this.location.back();
  }
}

class DailyTarget {
  centerId!: number;
  centerName!: string;
  regCode!: string;
}
