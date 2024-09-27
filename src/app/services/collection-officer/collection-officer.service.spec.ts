import { TestBed } from '@angular/core/testing';

import { CollectionOfficerService } from './collection-officer.service';

describe('CollectionOfficerService', () => {
  let service: CollectionOfficerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionOfficerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
