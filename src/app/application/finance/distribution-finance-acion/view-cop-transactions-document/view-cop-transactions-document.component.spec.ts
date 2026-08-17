import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCopTransactionsDocumentComponent } from './view-cop-transactions-document.component';

describe('ViewCopTransactionsDocumentComponent', () => {
  let component: ViewCopTransactionsDocumentComponent;
  let fixture: ComponentFixture<ViewCopTransactionsDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCopTransactionsDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCopTransactionsDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
