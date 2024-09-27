import { TestBed } from '@angular/core/testing';

import { CollectionOfficerReportService } from './collection-officer-report.service';

describe('CollectionOfficerReportService', () => {
  let service: CollectionOfficerReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionOfficerReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
