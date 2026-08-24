import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import Swal from 'sweetalert2';

interface BlockWord {
  id: number;
  word: string;
  createdAt: string;
}

@Component({
  selector: 'app-add-block-words',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-block-words.component.html',
  styleUrl: './add-block-words.component.css'
})
export class AddBlockWordsComponent implements OnInit {
  // Expose Math to template
  Math = Math;

  // Add word input
  newBlockWord: string = '';

  // Block words data
  blockWords: BlockWord[] = [];
  isLoading: boolean = false;

  // Search
  searchTerm: string = '';

  // Sort
  sortOrder: 'asc' | 'desc' = 'asc';
  isSortMenuOpen: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 18;
  totalItems: number = 0;

  constructor(
    private plantcareService: PlantcareUsersService
  ) {}

  ngOnInit(): void {
    this.loadBlockWords();
  }

  loadBlockWords(): void {
    this.isLoading = true;
    this.plantcareService.getAllBlockWords(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm
    ).subscribe({
      next: (response) => {
        if (response.status) {
          this.blockWords = response.items || [];
          this.totalItems = response.total || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading block words:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load block words',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold'
          }
        });
        this.isLoading = false;
      }
    });
  }

  get filteredWords(): BlockWord[] {
    let words = [...this.blockWords];

    // Sort
    words.sort((a, b) => {
      const comparison = a.word.localeCompare(b.word);
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return words;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  get pagedWords(): BlockWord[] {
    return this.filteredWords;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  addBlockWord(): void {
    const word = this.newBlockWord.trim();
    if (!word) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please enter a word to block',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold'
        }
      });
      return;
    }

    this.isLoading = true;
    this.plantcareService.addBlockWord(word).subscribe({
      next: (response) => {
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Block word added successfully',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white'
            }
          });
          this.newBlockWord = '';
          this.loadBlockWords();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.error || 'Failed to add block word',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold'
            }
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding block word:', error);
        let errorMessage = 'Failed to add block word';
        if (error.status === 409) {
          errorMessage = 'Word already exists in block list';
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold'
          }
        });
        this.isLoading = false;
      }
    });
  }

  removeBlockWord(id: number, word: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to remove "${word}" from block list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.plantcareService.deleteBlockWord(id).subscribe({
          next: (response) => {
            if (response.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Block word removed successfully',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white'
                }
              });
              this.loadBlockWords();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.error || 'Failed to remove block word',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold'
                }
              });
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error removing block word:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to remove block word',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold'
              }
            });
            this.isLoading = false;
          }
        });
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadBlockWords();
  }

  toggleSortMenu(): void {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  setSortOrder(order: 'asc' | 'desc'): void {
    this.sortOrder = order;
    this.isSortMenuOpen = false;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBlockWords();
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You will be navigated back to Plant Care dashboard!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/plant-care';
      }
    });
  }
}