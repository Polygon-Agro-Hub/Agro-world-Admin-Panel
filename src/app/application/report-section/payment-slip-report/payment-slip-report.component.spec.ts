import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSlipReportComponent } from './payment-slip-report.component';

describe('PaymentSlipReportComponent', () => {
  let component: PaymentSlipReportComponent;
  let fixture: ComponentFixture<PaymentSlipReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSlipReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentSlipReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
