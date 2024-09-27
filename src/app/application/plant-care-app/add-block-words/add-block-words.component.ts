import { Component } from '@angular/core';

@Component({
  selector: 'app-add-block-words',
  standalone: true,
  imports: [],
  templateUrl: './add-block-words.component.html',
  styleUrl: './add-block-words.component.css'
})
export class AddBlockWordsComponent {

  newBlockWord: string = '';
  blockWords: string[] = [];

  addBlockWord() {
    if (this.newBlockWord.trim()) {
      this.blockWords.push(this.newBlockWord.trim());
      this.newBlockWord = '';
    }
  }

  removeBlockWord(index: number) {
    this.blockWords.splice(index, 1);
  }

  onCancel() {
    this.newBlockWord = '';
  }

}
