import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-market-add-product',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatFormFieldModule, 
    MatChipsModule, 
    FormsModule, 
    MatIconModule
  ],
  templateUrl: './market-add-product.component.html',
  styleUrls: ['./market-add-product.component.css']
})
export class MarketAddProductComponent {
  readonly templateKeywords = signal<string[]>([]);

  announcer = inject(LiveAnnouncer);

  removeTemplateKeyword(keyword: string) {
    this.templateKeywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword} from template form`);
      return [...keywords];
    });
  }

  addTemplateKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.templateKeywords.update(keywords => [...keywords, value]);
      this.announcer.announce(`added ${value} to template form`);
    }

    event.chipInput!.clear();
  }

}
