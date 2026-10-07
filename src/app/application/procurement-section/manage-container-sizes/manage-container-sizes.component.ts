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
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface ContainerSize {
  id: number;
  createIndex?: number;
  labelName: string;
  weight: number;
  modifyBy: string;
  modifyByName?: string;
  modifyAt: Date;
}

@Component({
  selector: 'app-manage-container-sizes',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
  templateUrl: './manage-container-sizes.component.html',
  styleUrl: './manage-container-sizes.component.css',
})
export class ManageContainerSizesComponent implements OnInit {
  isLoading = true;
  containerSizes: ContainerSize[] = [];

  constructor(
    private procementsService: ProcumentsService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,

  ) { }

  ngOnInit(): void {
    this.loadContainers();
  }

  loadContainers(silent = false): void {
    if (!silent) this.isLoading = true;
    this.procementsService.getManageContainerSizes().subscribe({
      next: (data) => {
        this.containerSizes = (data?.data ?? []).map(
          (container: ContainerSize) => ({
            ...container,
            weight: Number(container.weight),
          }),
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.error || 'Failed to load Container sizes.',
          confirmButtonColor: '#3980C0',
        });
      },
    });
  }

  trackById(_: number, item: ContainerSize): number {
    return item.id;
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  addNew(): void {
    this.router.navigate(['/procurement/add-new-container']);
  }

  editContainer(id: number): void {
    this.router.navigate(['/procurement/edit-container', id]);
  }

  drop(event: CdkDragDrop<ContainerSize[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const previousOrder = [...this.containerSizes];

    moveItemInArray(
      this.containerSizes,
      event.previousIndex,
      event.currentIndex,
    );

    const orderedIds = this.containerSizes.map((container) => container.id);

    this.procementsService.reorderContainerSizes(orderedIds).subscribe({
      next: () => {
        this.loadContainers(true);
      },
      error: (error) => {
        console.error(error);
        this.containerSizes = previousOrder;
        Swal.fire({
          icon: 'error',
          title: 'Reorder failed',
          text: error?.error?.message || 'Unable to save the new order.',
          confirmButtonColor: '#3980C0',
        });
      },
    });
  }

  deleteContainer(id: number): void {
    Swal.fire({
      icon: 'warning',
      text: 'Are you sure you want to delete this Container size?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isLoading = true;
      this.procementsService.deleteManageContainerSize(id).subscribe({
        next: () => {
          this.containerSizes = this.containerSizes.filter(
            (container) => container.id !== id,
          );
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
            text:
              error?.error?.error || 'Unable to delete this Container size.',
            confirmButtonColor: '#3980C0',
          });
        },
      });
    });
  }
}
