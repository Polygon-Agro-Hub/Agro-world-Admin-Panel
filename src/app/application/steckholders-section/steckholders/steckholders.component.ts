import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-steckholders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './steckholders.component.html',
  styleUrl: './steckholders.component.css'
})
export class SteckholdersComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  private clickListener: any;
  isButton2Clicked = false;
  isButton3Clicked = false;
  isButton4Clicked = false;
  isButton5Clicked = false;
  isButton6Clicked = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public tokenService: TokenService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.clickListener = this.onDocumentClick.bind(this);
      document.addEventListener('click', this.clickListener);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isButton2Clicked = false;
    this.isButton3Clicked = false;
  }

  onDocumentClick(event: Event) {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  onButton2Click(event: Event) {
    event.stopPropagation();
    this.isButton2Clicked = !this.isButton2Clicked;
    this.isDropdownOpen = false;
    this.isButton3Clicked = false;
  }

  onButton3Click(event: Event) {
    event.stopPropagation();
    this.isButton3Clicked = !this.isButton3Clicked;
    this.isDropdownOpen = false;
    this.isButton2Clicked = false;
  }

  onButton4Click(event: Event) {
    event.stopPropagation();
    this.isButton4Clicked = !this.isButton4Clicked;
    this.isDropdownOpen = false;
    this.isButton2Clicked = false;
  }

  onButton5Click(event: Event) {
    event.stopPropagation();
    this.isButton5Clicked = !this.isButton5Clicked;
    this.isDropdownOpen = false;
    this.isButton2Clicked = false;
  }

  onButton6Click(event: Event) {
    event.stopPropagation();
    this.isButton6Clicked = !this.isButton6Clicked;
    this.isDropdownOpen = false;
    this.isButton2Clicked = false;
  }
}