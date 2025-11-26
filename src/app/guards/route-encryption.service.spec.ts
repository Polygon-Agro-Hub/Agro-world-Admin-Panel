import { TestBed } from '@angular/core/testing';

import { RouteEncryptionService } from './route-encryption.service';

describe('RouteEncryptionService', () => {
  let service: RouteEncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteEncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
