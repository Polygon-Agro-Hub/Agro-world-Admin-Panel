import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../../services/procuments/procuments.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { TokenService } from '../../../../services/token/services/token.service';
import Swal from 'sweetalert2';

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
  label: string;
}

@Component({
  selector: 'app-shortage-assign',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './shortage-assign.component.html',
  styleUrl: './shortage-assign.component.css',
})

export class ShortageAssignComponent implements OnInit {
  isLoading = false;

  itemId!: number;
  selectedItem: ShortageItem | null = null;
  centres: Centre[] = [];

  assignQty: number = 0;
  selectedCentreId: number | null = null;
  ceilingPercent: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private procumentService: ProcumentsService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

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
          name: c.centerName,
          label: `${c.regCode} ${c.centerName}`,
        }));

        this.selectedItem = {
          id: this.itemId,
          name: res.displayName,
          image: res.image,
          shortageQty: res.shortageQty,
          assignedQty: 0,
          unit: res.unitType || 'kg',
          marketPrice: res.buyPrice,
          assignments: [],
        };

        this.loadAssignedDetails();
      },
      error: (err) => {
        console.error('Error fetching shortage details:', err);
        this.isLoading = false;
        this.router.navigate(['/shortage-today']);
      },
    });
  }

  loadAssignedDetails(): void {
    this.procumentService.getShortageAssignedDetails(this.itemId).subscribe({
      next: (res: any[]) => {
        if (this.selectedItem) {
          this.selectedItem.assignments = (res || []).map((a: any) => {
            const centre = this.centres.find((c) => c.id === a.comCenId);
            return {
              qty: a.qty,
              centreLabel: centre
                ? `${centre.code} ${centre.name}`
                : `Centre #${a.comCenId}`,
              ceiling: a.ceilling,
            };
          });

          const totalAssigned = this.selectedItem.assignments.reduce(
            (sum, a) => sum + a.qty,
            0,
          );
          this.selectedItem.assignedQty = totalAssigned;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching shortage assigned details:', err);
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  get canAssign(): boolean {
    return (
      this.assignQty > 0 &&
      this.assignQty <= (this.selectedItem?.shortageQty ?? 0) &&
      this.selectedCentreId !== null &&
      this.ceilingPercent >= 1 &&
      this.ceilingPercent <= 99
    );
  }

  get selectedCentre(): Centre | null {
    return this.centres.find((c) => c.id === this.selectedCentreId) || null;
  }

  onAssign(): void {
    if (!this.canAssign || !this.selectedItem || !this.selectedCentre) {
      return;
    }

    const centre = this.selectedCentre;

    Swal.fire({
      title: 'Assign Confirmation',
      text: `Are you sure you want to assign ${this.formatNumber(this.assignQty)} ${this.selectedItem.unit} of ${this.selectedItem.name} to ${centre.code} (${centre.name})?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Assign',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#3980C0',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white rounded-xl',
        title: 'font-semibold text-lg',
        actions: 'flex-row-reverse justify-start',
        confirmButton: 'rounded-lg',
        cancelButton: 'rounded-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmAssign();
      }
    });
  }

  confirmAssign(): void {
    if (!this.selectedItem || !this.selectedCentre) {
      return;
    }

    const centre = this.selectedCentre;
    const qty = this.assignQty;
    const ceiling = this.ceilingPercent;

    this.isLoading = true;

    this.procumentService
      .assignShortage(this.itemId, {
        comCenId: centre.id,
        qty: qty,
        ceilling: ceiling,
      })
      .subscribe({
        next: (res: any) => {
          window.location.reload();
        },
        error: (err) => {
          console.error('Error assigning shortage:', err);
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while assigning the shortage.',
            icon: 'error',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
      });
  }

  private resetAssignForm(): void {
    this.assignQty = 0;
    this.selectedCentreId = null;
    this.ceilingPercent = 0;
  }

  onQtyInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    const match = value.match(/^\d*(\.\d{0,3})?/);
    const trimmed = match ? match[0] : value;

    if (trimmed !== value) {
      input.value = trimmed;
    }

    this.assignQty = trimmed === '' ? 0 : Number(trimmed);
  }

  blockDecimalKey(event: KeyboardEvent): void {
    if (['.', ',', 'e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onCeilingInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    let digitsOnly = value.replace(/\D/g, '');
    digitsOnly = digitsOnly.replace(/^0+/, '');
    digitsOnly = digitsOnly.slice(0, 2);

    let num = digitsOnly === '' ? 0 : Number(digitsOnly);

    if (num > 99) {
      num = 99;
      digitsOnly = '99';
    }

    if (digitsOnly !== value) {
      input.value = digitsOnly;
    }

    this.ceilingPercent = num;
  }

  formatNumber(value: number): string {
    return value.toString().replace(/\.?0+$/, '');
  }
}