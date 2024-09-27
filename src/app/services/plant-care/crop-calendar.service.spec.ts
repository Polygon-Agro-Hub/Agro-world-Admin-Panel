import { TestBed } from '@angular/core/testing';

import { CropCalendarService } from './crop-calendar.service';

describe('CropCalendarService', () => {
  let service: CropCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CropCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
