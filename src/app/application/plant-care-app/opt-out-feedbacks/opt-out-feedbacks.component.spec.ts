import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptOutFeedbacksComponent } from './opt-out-feedbacks.component';

describe('OptOutFeedbacksComponent', () => {
  let component: OptOutFeedbacksComponent;
  let fixture: ComponentFixture<OptOutFeedbacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptOutFeedbacksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OptOutFeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
