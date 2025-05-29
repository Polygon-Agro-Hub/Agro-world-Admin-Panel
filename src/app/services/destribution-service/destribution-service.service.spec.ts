import { TestBed } from '@angular/core/testing';

import { DestributionServiceService } from './destribution-service.service';

describe('DestributionServiceService', () => {
  let service: DestributionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DestributionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
