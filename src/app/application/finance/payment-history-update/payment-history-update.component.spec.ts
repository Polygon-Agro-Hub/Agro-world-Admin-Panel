import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryUpdateComponent } from './payment-history-update.component';

describe('PaymentHistoryUpdateComponent', () => {
  let component: PaymentHistoryUpdateComponent;
  let fixture: ComponentFixture<PaymentHistoryUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentHistoryUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
