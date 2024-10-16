import { TestBed } from '@angular/core/testing';

import { CollectionCenterService } from './collection-center.service';

describe('CollectionCenterService', () => {
  let service: CollectionCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
