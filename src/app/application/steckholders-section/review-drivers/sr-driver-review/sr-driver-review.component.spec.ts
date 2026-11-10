import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrDriverReviewComponent } from './sr-driver-review.component';

describe('SrDriverReviewComponent', () => {
  let component: SrDriverReviewComponent;
  let fixture: ComponentFixture<SrDriverReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrDriverReviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SrDriverReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
