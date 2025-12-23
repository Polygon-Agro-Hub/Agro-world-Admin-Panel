import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-id-proof-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './id-proof-tab.component.html',
  styleUrl: './id-proof-tab.component.css',
})
export class IdProofTabComponent implements OnChanges {
  @Input() personalArr!: Question[];
  @Input() imageBasePath: string = '';

  isModalOpen = false;
  modalTitle = '';
  modalImage = '';
  scale = 1;

  idProof = {
    proofType: '',
    nicNumber: '',
    frontPhoto: '',
    backPhoto: '',
  };

  ngOnChanges(): void {
    const getByLabel = (label: string) =>
      (this.personalArr || []).find((q) => q.quaction === label)?.answer ?? '';

    this.idProof.proofType = getByLabel('ID Proof Type') || 'NIC';
    this.idProof.nicNumber = getByLabel('NIC Number');
    this.idProof.frontPhoto = getByLabel('NIC Front Photo');
    this.idProof.backPhoto = getByLabel('NIC Back Photo');

    console.log('[IdProofTab] personalArr ->', this.personalArr);
    console.log('[IdProofTab] idProof ->', this.idProof);
  }

  private resolveImageUrl(filename: string): string {
    if (/^https?:\/\//i.test(filename)) return filename;

    if (this.imageBasePath) {
      const hasSlash = this.imageBasePath.endsWith('/');
      return `${this.imageBasePath}${hasSlash ? '' : '/'}${filename}`;
    }
    return `assets/uploads/${filename}`;
  }

  openModal(type: 'front' | 'back') {
    this.scale = 1;
    this.isModalOpen = true;

    const titleBase =
      this.idProof.proofType && this.idProof.proofType.trim() !== ''
        ? this.idProof.proofType
        : 'NIC';

    if (type === 'front') {
      this.modalTitle = `${titleBase} Front Photo`;
      this.modalImage = this.resolveImageUrl(this.idProof.frontPhoto);
    } else {
      this.modalTitle = `${titleBase} Back Photo`;
      this.modalImage = this.resolveImageUrl(this.idProof.backPhoto);
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  zoomIn() {
    this.scale += 0.1;
  }

  zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.1;
    }
  }
}

interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
}
