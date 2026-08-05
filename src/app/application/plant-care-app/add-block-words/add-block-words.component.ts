import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-block-words',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-block-words.component.html',
  styleUrl: './add-block-words.component.css'
})
export class AddBlockWordsComponent {

  // Add word input
  newBlockWord: string = '';

  // TODO: replace with data from API. Seeded with 50 sample words so
  // pagination is visible out of the box (matches "All Block Words (50)").
  blockWords: string[] = this.generateSampleWords();

  isLoading: boolean = false;

  // Search
  searchTerm: string = '';

  // Sort
  sortOrder: 'asc' | 'desc' = 'asc';
  isSortMenuOpen: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 18;

  private generateSampleWords(): string[] {
    const base = ['Fraud', 'Scam', 'Fake', 'Corruption', 'Bribe', 'Blacklist'];
    return Array.from({ length: 50 }, (_, i) => {
      const word = base[i % base.length];
      const suffix = Math.floor(i / base.length);
      return suffix === 0 ? word : `${word}${suffix}`;
    });
  }

  get filteredWords(): string[] {
    let words = [...this.blockWords];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      words = words.filter(w => w.toLowerCase().includes(term));
    }

    words.sort((a, b) =>
      this.sortOrder === 'asc'
        ? a.localeCompare(b)
        : b.localeCompare(a)
    );

    return words;
  }

  // Pagination is driven off the filtered count, not the raw list,
  // so searching/filtering recalculates the number of pages correctly.
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredWords.length / this.itemsPerPage));
  }

  get pagedWords(): string[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredWords.slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  addBlockWord() {
    const word = this.newBlockWord.trim();
    if (word && !this.blockWords.some(w => w.toLowerCase() === word.toLowerCase())) {
      this.blockWords.push(word);
      this.newBlockWord = '';
      this.currentPage = 1;
    }
  }

  removeBlockWord(word: string) {
    const index = this.blockWords.indexOf(word);
    if (index > -1) {
      this.blockWords.splice(index, 1);
      // keep current page valid after deletion
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    }
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  toggleSortMenu() {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  setSortOrder(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.isSortMenuOpen = false;
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  back() {
    window.location.href = '/plant-care';
  }
}