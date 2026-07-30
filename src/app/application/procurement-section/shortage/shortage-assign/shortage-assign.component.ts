import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";
import { ProcumentsService } from '../../../../services/procuments/procuments.service'; // adjust path/name as needed

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
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './shortage-assign.component.html',
  styleUrl: './shortage-assign.component.css'
})
export class ShortageAssignComponent implements OnInit {

  isLoading = false;

  itemId!: number;
  selectedItem: ShortageItem | null = null;
  centres: Centre[] = [];

  assignQty: number = 0;
  selectedCentreId: number | null = null;
  ceilingPercent: number = 0;

  showConfirmModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private procumentService: ProcumentsService
  ) {}

  ngOnInit(): void {
    this.itemId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.itemId) {
      this.router.navigate(['/shortage-today']);
      return;
    }

    this.loadShortageDetails();
  }

  loadShortageDetails(): void {
    this.isLoading = true;

    this.procumentService.getShortageDetailsById(this.itemId).subscribe({
      next: (res: any) => {
        this.centres = (res.centers || []).map((c: any) => ({
          id: c.id,
          code: c.regCode,
          name: c.centerName
        }));

        this.selectedItem = {
          id: this.itemId,
          name: res.displayName,
          image: res.image,
          shortageQty: res.shortageQty,
          assignedQty: 0,
          unit: res.unitType || 'kg',
          marketPrice: res.buyPrice,
          assignments: []
        };

        this.loadAssignedDetails();
      },
      error: (err) => {
        console.error('Error fetching shortage details:', err);
        this.isLoading = false;
        this.router.navigate(['/shortage-today']);
      }
    });
  }

  loadAssignedDetails(): void {
    this.procumentService.getShortageAssignedDetails(this.itemId).subscribe({
      next: (res: any[]) => {
        if (this.selectedItem) {
          this.selectedItem.assignments = (res || []).map((a: any) => {
            const centre = this.centres.find(c => c.id === a.comCenId);
            return {
              qty: a.qty,
              centreLabel: centre ? `${centre.code} ${centre.name}` : `Centre #${a.comCenId}`,
              ceiling: a.ceilling
            };
          });

          const totalAssigned = this.selectedItem.assignments.reduce((sum, a) => sum + a.qty, 0);
          this.selectedItem.assignedQty = totalAssigned;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching shortage assigned details:', err);
        this.isLoading = false;
      }
    });
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
    const ceiling = this.ceilingPercent;

    this.isLoading = true;

    this.procumentService.assignShortage(this.itemId, {
      comCenId: centre.id,
      qty: qty,
      ceilling: ceiling
    }).subscribe({
      next: (res: any) => {
        if (this.selectedItem) {
          this.selectedItem.assignments.push({
            qty: qty,
            centreLabel: `${centre.code} ${centre.name}`,
            ceiling: ceiling
          });

          this.selectedItem.shortageQty = Math.max(0, this.selectedItem.shortageQty - qty);
          this.selectedItem.assignedQty += qty;
        }

        this.showConfirmModal = false;
        this.resetAssignForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error assigning shortage:', err);
        this.showConfirmModal = false;
        this.isLoading = false;
      }
    });
  }

  private resetAssignForm(): void {
    this.assignQty = 0;
    this.selectedCentreId = null;
    this.ceilingPercent = 0;
  }
}