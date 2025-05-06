import { TestBed } from '@angular/core/testing';

import { AuthContextService } from './auth-context.service';

describe('AuthContextService', () => {
  let service: AuthContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
