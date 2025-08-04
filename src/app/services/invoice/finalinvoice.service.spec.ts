import { TestBed } from '@angular/core/testing';

import { FinalinvoiceService } from './finalinvoice.service';

describe('FinalinvoiceService', () => {
  let service: FinalinvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinalinvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
