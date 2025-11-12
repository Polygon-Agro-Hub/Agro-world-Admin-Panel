import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryAddNewComponent } from './payment-history-add-new.component';

describe('PaymentHistoryAddNewComponent', () => {
  let component: PaymentHistoryAddNewComponent;
  let fixture: ComponentFixture<PaymentHistoryAddNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryAddNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentHistoryAddNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
