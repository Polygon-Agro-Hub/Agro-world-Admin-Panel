import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-manage-container-sizes',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder],
  templateUrl: './manage-container-sizes.component.html',
  styleUrl: './manage-container-sizes.component.css'
})
export class ManageContainerSizesComponent implements OnInit {

  isLoading = true;
  containerSizes: ContainerSize[] = [];

  constructor(
    private procementsService: ProcumentsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.procementsService.getManageContainerSizes().subscribe({
      next: (data) => {
        this.containerSizes = (data?.data ?? []).map((container: ContainerSize) => ({
          ...container,
          weight: Number(container.weight),
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  addNew(): void {
    this.router.navigate(['/procurement/add-new-container']);
  }

  drop(event: CdkDragDrop<ContainerSize[]>): void {
    moveItemInArray(this.containerSizes, event.previousIndex, event.currentIndex);
  }

  deleteContainer(index: number): void {
    const container = this.containerSizes[index];

    Swal.fire({
      icon: 'warning',
      text: 'Are you sure you want to delete this Container size?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.procementsService.deleteManageContainerSize(container.id).subscribe({
          next: () => {
            this.containerSizes.splice(index, 1);
            this.containerSizes = [...this.containerSizes];
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Container size deleted successfully.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error(error);
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Delete failed',
              text: 'Unable to delete this Container size.',
            });
          },
        });
      }
    });
  }
}

interface ContainerSize {
  id: number;
  labelName: string;
  weight: number;
  modifyBy: string;
  modifyAt: string;
}