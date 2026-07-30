import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';

interface AssignmentRecord {
  qty: number;
  centreLabel: string;
  ceiling: number;
}

interface ShortageItem {
  id: number;
  name: string;
  image: string;
  shortageQty: number;
  assignedQty: number;
  unit: string;
  marketPrice: number;
  assignments: AssignmentRecord[];
}

interface Centre {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-shortage-assign',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './shortage-assign.component.html',
  styleUrl: './shortage-assign.component.css'
})
export class ShortageAssignComponent implements OnInit {
  // Same dummy data, duplicated here so this component is self-contained
  shortages: ShortageItem[] = [
    { id: 1, name: 'Garlic', image: '/assets/images/garlic.png', shortageQty: 20, assignedQty: 0, unit: 'kg', marketPrice: 100.00, assignments: [] },
    { id: 2, name: 'Turmeric', image: '/assets/images/turmeric.png', shortageQty: 0.5, assignedQty: 20, unit: 'kg', marketPrice: 100.00, assignments: [] },
    { id: 3, name: 'Watermelon', image: '/assets/images/watermelon.png', shortageQty: 0, assignedQty: 20, unit: 'kg', marketPrice: 100.00, assignments: [] }
  ];

  centres: Centre[] = [
    { id: 1, code: 'D-WPCK-01', name: 'Kollupitiya Central Distribution Centre' },
    { id: 2, code: 'D-WPCK-02', name: 'Kollupitiya Central Distribution Centre' },
    { id: 3, code: 'D-WPCK-03', name: 'Kollupitiya Central Distribution Centre' }
  ];

  selectedItem: ShortageItem | null = null;

  assignQty: number = 0;
  selectedCentreId: number | null = null;
  ceilingPercent: number = 0;

  showConfirmModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.selectedItem = this.shortages.find(s => s.id === id) ?? null;

    if (!this.selectedItem) {
      this.router.navigate(['/shortage-today']);
    }
  }

  goBack(): void {
    this.location.back();
  }

  get canAssign(): boolean {
    return this.assignQty > 0
      && this.assignQty <= (this.selectedItem?.shortageQty ?? 0)
      && this.selectedCentreId !== null;
  }

  get selectedCentre(): Centre | null {
    return this.centres.find(c => c.id === this.selectedCentreId) || null;
  }

  onAssign(): void {
    if (!this.canAssign) {
      return;
    }
    this.showConfirmModal = true;
  }

  cancelAssign(): void {
    this.showConfirmModal = false;
  }

  confirmAssign(): void {
    if (!this.selectedItem || !this.selectedCentre) {
      return;
    }

    const centre = this.selectedCentre;
    const qty = this.assignQty;

    this.selectedItem.assignments.push({
      qty: qty,
      centreLabel: `${centre.code} ${centre.name}`,
      ceiling: this.ceilingPercent
    });

    this.selectedItem.shortageQty = Math.max(0, this.selectedItem.shortageQty - qty);
    this.selectedItem.assignedQty += qty;

    console.log('Assigned', {
      item: this.selectedItem.name,
      qty,
      centre,
      ceiling: this.ceilingPercent
    });
    // TODO: call your API here

    this.showConfirmModal = false;
    this.resetAssignForm();
  }

  private resetAssignForm(): void {
    this.assignQty = 0;
    this.selectedCentreId = null;
    this.ceilingPercent = 0;
  }
}