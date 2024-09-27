import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBlockWordsComponent } from './add-block-words.component';

describe('AddBlockWordsComponent', () => {
  let component: AddBlockWordsComponent;
  let fixture: ComponentFixture<AddBlockWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBlockWordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBlockWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
