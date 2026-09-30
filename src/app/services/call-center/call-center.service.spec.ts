import { TestBed } from '@angular/core/testing';

import { CallCenterService } from './call-center.service';

describe('CallCenterService', () => {
  let service: CallCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
