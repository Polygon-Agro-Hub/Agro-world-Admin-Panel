import { TestBed } from '@angular/core/testing';

import { ProcumentsService } from './procuments.service';

describe('ProcumentsService', () => {
  let service: ProcumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
