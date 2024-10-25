import { TestBed } from '@angular/core/testing';

import { MarketPriceService } from './market-price.service';

describe('MarketPriceService', () => {
  let service: MarketPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
