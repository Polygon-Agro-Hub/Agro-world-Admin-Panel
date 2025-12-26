import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-labour-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './labour-tab.component.html',
  styleUrl: './labour-tab.component.css'
})
export class LabourTabComponent implements OnChanges {

  @Input() LaborObj!: ILabor;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('---------------------------------------------------------------');
    console.log(this.LaborObj);
    
  }

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
