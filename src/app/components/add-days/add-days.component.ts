import { Component, Input, Output, EventEmitter } from '@angular/core';
//import { CKEditor4, CKEditorComponent, CKEditorModule } from 'ckeditor4-angular';
// import { QuillModule } from 'ngx-quill';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-days',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './add-days.component.html',
  styleUrl: './add-days.component.css',
})
export class AddDaysComponent {
  @Input() dayNumber!: number;
  @Output() formDataChanged = new EventEmitter<any>();

  formData = {
    title: '',
    daysnum: '',
    description: '',
  };

  getFormData() {
    return this.formData;
  }
}
