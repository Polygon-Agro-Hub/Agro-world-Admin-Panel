import { TestBed } from '@angular/core/testing';

import { MarketPlaceService } from './market-place.service';

describe('MarketPlaceService', () => {
  let service: MarketPlaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketPlaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
