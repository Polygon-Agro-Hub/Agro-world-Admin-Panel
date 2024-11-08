import { TestBed } from '@angular/core/testing';

import { FarmerListReportService } from './farmer-list-report.service';

describe('FarmerListReportService', () => {
  let service: FarmerListReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmerListReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
