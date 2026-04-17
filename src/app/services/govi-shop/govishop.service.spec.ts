import { TestBed } from '@angular/core/testing';

import { GovishopService } from './govishop.service';

describe('GovishopService', () => {
  let service: GovishopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GovishopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
