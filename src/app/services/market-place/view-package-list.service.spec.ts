import { TestBed } from '@angular/core/testing';

import { ViewPackageListService } from './view-package-list.service';

describe('ViewPackageListService', () => {
  let service: ViewPackageListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewPackageListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
