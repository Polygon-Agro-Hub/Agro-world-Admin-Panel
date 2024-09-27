import { TestBed } from '@angular/core/testing';

import { OngoingCultivationService } from './ongoing-cultivation.service';

describe('OngoingCultivationService', () => {
  let service: OngoingCultivationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OngoingCultivationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
