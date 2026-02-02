import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-id-proof-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './id-proof-tab.component.html',
  styleUrl: './id-proof-tab.component.css',
})
export class IdProofTabComponent implements OnChanges {
  @Input() idInfo!: IIdInfo;
  @Input() currentPage: number = 2;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();

  isModalOpen = false;
  modalTitle = '';
  modalImage = '';
  scale = 1;
  
  // Pan functionality
  isPanning = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;

  ngOnChanges(): void {
    console.log(this.idInfo);
  }

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  getProofTypeDisplay(): string {
    if (!this.idInfo || !this.idInfo.pType) return 'ID';

    const type = this.idInfo.pType.trim();

    if (type.toLowerCase() === 'license') {
      return 'Driving License';
    }

    return type;
  }

  openModal(type: 'front' | 'back'): void {
    if (!this.idInfo) return;

    this.scale = 1;
    this.isModalOpen = true;

    const title = this.getProofTypeDisplay();

    if (type === 'front') {
      this.modalTitle = `${title} Front Photo`;
      this.modalImage = this.idInfo.frontImg;
    } else {
      this.modalTitle = `${title} Back Photo`;
      this.modalImage = this.idInfo.backImg;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalImage = '';
    this.scale = 1;
    this.resetPan();
  }

  zoomIn(): void {
    this.scale += 0.1;
  }

  zoomOut(): void {
    if (this.scale > 0.5) {
      this.scale -= 0.1;
    }
  }

  // Pan (drag) functionality
  onMouseDown(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  onMouseLeave(): void {
    this.isPanning = false;
  }

  resetPan(): void {
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
  }

  getImageTransform(): string {
    return `scale(${this.scale}) translate(${this.translateX / this.scale}px, ${this.translateY / this.scale}px)`;
  }
}

interface IIdInfo {
  pType: string;
  pNumber: string;
  frontImg: string;
  backImg: string;
}
