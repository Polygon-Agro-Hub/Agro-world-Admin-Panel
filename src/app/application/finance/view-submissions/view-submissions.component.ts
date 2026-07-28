import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

interface Submission {
  id: number;
  imageUrl: string;
  product: string;
  purchasedKg: number;
  assigneeId: string;
  name: string;
  phoneNumber: string;
  centre: string;
  status: 'To Review' | 'Finalized';
  purchasedAt: Date;
  finalizedBy: string | null;
  finalizedAt: Date | null;
}

const MOCK_IMAGE =
  'https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/marketplacepackages/image/c3fe76e9-4d89-4327-ac62-4dbec33f7c36.png';

@Component({
  selector: 'app-view-submissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    NgxPaginationModule,
    LoadingSpinnerComponent
],
  templateUrl: './view-submissions.component.html',
  styleUrl: './view-submissions.component.css'
})
export class ViewSubmissionsComponent implements OnInit {

  isLoading = false;

  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;

  selectedStatus: string = '';
  date: Date | null = null;

  StatusOptions = [
    { label: 'To Review', value: 'To Review' },
    { label: 'Finalized', value: 'Finalized' },
  ];

  allSubmissions: Submission[] = [
    {
      id: 1,
      imageUrl: MOCK_IMAGE,
      product: 'Capsicum',
      purchasedKg: 15,
      assigneeId: 'DCM00001',
      name: 'Amal Perera',
      phoneNumber: '0772828600',
      centre: 'D-WPCK-01',
      status: 'To Review',
      purchasedAt: new Date('2026-02-01T11:00:00'),
      finalizedBy: null,
      finalizedAt: null
    },
    {
      id: 2,
      imageUrl: MOCK_IMAGE,
      product: 'Capsicum',
      purchasedKg: 10.5,
      assigneeId: 'DIO00002',
      name: 'Biman Perera',
      phoneNumber: '0772828600',
      centre: 'D-WPCK-02',
      status: 'To Review',
      purchasedAt: new Date('2026-02-01T11:01:00'),
      finalizedBy: null,
      finalizedAt: null
    },
    {
      id: 3,
      imageUrl: MOCK_IMAGE,
      product: 'Dragon Fruit',
      purchasedKg: 11,
      assigneeId: 'DIO00003',
      name: 'Hashini Herath',
      phoneNumber: '0772828600',
      centre: 'D-WPCK-01',
      status: 'To Review',
      purchasedAt: new Date('2026-02-01T11:02:00'),
      finalizedBy: null,
      finalizedAt: null
    },
    {
      id: 4,
      imageUrl: MOCK_IMAGE,
      product: 'Pineapple',
      purchasedKg: 5,
      assigneeId: 'DIO00004',
      name: 'Sandun Kalhara',
      phoneNumber: '0772828600',
      centre: 'D-WPCK-02',
      status: 'To Review',
      purchasedAt: new Date('2026-02-01T11:03:00'),
      finalizedBy: null,
      finalizedAt: null
    },
    {
      id: 5,
      imageUrl: MOCK_IMAGE,
      product: 'Pineapple',
      purchasedKg: 120,
      assigneeId: 'DIO00004',
      name: 'Sandun Kalhara',
      phoneNumber: '0772828600',
      centre: 'D-WPCK-03',
      status: 'Finalized',
      purchasedAt: new Date('2026-02-01T11:04:00'),
      finalizedBy: 'Hashini',
      finalizedAt: new Date('2026-02-01T11:04:00')
    }
  ];

  constructor(private location: Location) {}

  ngOnInit(): void {
    console.log('View Submissions Component Initialized');
  }

  get filteredSubmissions(): Submission[] {
    return this.allSubmissions.filter(item => {
      const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;

      const matchesDate =
        !this.date ||
        new Date(item.purchasedAt).toDateString() === new Date(this.date).toDateString();

      const search = this.searchItem?.trim().toLowerCase();
      const matchesSearch =
        !search ||
        item.assigneeId.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search) ||
        item.phoneNumber.toLowerCase().includes(search);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }

  get totalItems(): number {
    return this.filteredSubmissions.length;
  }

  get hasData(): boolean {
    return this.filteredSubmissions.length > 0;
  }

  onPageChange(event: number) {
    this.page = event;
  }

  searchSubmissions() {
    this.searchItem = this.searchItem?.trim() || '';
    this.page = 1;
  }

  clearSearch(): void {
    this.searchItem = '';
    this.page = 1;
  }

  statusFilter() {
    this.page = 1;
  }

  dateFilter() {
    this.page = 1;
  }

  onDateClear() {
    this.date = null;
    this.page = 1;
  }

  navigateToInvoice(id: number) {
    console.log('View invoice for submission', id);
  }

  goBack(): void {
    this.location.back();
  }
}