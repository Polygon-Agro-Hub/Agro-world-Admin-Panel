import { TestBed } from '@angular/core/testing';

import { PaymentSlipReportService } from './payment-slip-report.service';

describe('PaymentSlipReportService', () => {
  let service: PaymentSlipReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentSlipReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
