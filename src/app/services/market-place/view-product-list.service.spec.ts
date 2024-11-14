import { TestBed } from '@angular/core/testing';

import { ViewProductListService } from './view-product-list.service';

describe('ViewProductListService', () => {
  let service: ViewProductListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewProductListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
