import { TestBed } from '@angular/core/testing';

import { OptOutFeedbacksService } from './opt-out-feedbacks.service';

describe('OptOutFeedbacksService', () => {
  let service: OptOutFeedbacksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptOutFeedbacksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
