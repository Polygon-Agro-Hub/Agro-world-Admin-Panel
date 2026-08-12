import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransactionDocumentComponent } from './view-transaction-document.component';

describe('ViewTransactionDocumentComponent', () => {
  let component: ViewTransactionDocumentComponent;
  let fixture: ComponentFixture<ViewTransactionDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTransactionDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTransactionDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
