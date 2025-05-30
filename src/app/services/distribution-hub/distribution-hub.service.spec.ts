import { TestBed } from '@angular/core/testing';

import { DistributionHubService } from './distribution-hub.service';

describe('DistributionHubService', () => {
  let service: DistributionHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistributionHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
