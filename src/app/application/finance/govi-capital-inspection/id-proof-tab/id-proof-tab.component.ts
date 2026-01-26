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
  }

  zoomIn(): void {
    this.scale += 0.1;
  }

  zoomOut(): void {
    if (this.scale > 0.5) {
      this.scale -= 0.1;
    }
  }
}

interface IIdInfo {
  pType: string;
  pNumber: string;
  frontImg: string;
  backImg: string;
}
