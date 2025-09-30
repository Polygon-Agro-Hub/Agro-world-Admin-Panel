import { TestBed } from '@angular/core/testing';

import { CertificateCompanyService } from './certificate-company.service';

describe('CropCalendarService', () => {
  let service: CertificateCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CertificateCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
