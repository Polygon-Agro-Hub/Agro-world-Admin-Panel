import { TestBed } from '@angular/core/testing';

import { SalesDashService } from './sales-dash.service';

describe('SalesDashService', () => {
  let service: SalesDashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesDashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
