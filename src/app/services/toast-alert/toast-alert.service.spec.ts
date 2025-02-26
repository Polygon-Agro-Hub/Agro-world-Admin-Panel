import { TestBed } from '@angular/core/testing';

import { ToastAlertService } from './toast-alert.service';

describe('ToastAlertService', () => {
  let service: ToastAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
