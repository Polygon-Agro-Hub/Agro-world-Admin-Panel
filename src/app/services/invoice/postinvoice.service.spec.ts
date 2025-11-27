import { TestBed } from '@angular/core/testing';

import { PostinvoiceService } from './postinvoice.service';

describe('PostinvoiceService', () => {
  let service: PostinvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostinvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
