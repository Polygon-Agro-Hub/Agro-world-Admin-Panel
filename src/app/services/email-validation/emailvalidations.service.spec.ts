import { TestBed } from '@angular/core/testing';

import { EmailvalidationsService } from './emailvalidations.service';

describe('EmailvalidationsService', () => {
  let service: EmailvalidationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailvalidationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
