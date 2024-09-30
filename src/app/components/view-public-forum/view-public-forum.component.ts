import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-view-public-forum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-public-forum.component.html',
  styleUrl: './view-public-forum.component.css',
})
export class ViewPublicForumComponent {
  isDeleteVisible = false;
  toggleDeleteButton() {
    this.isDeleteVisible = !this.isDeleteVisible;
  }
}
