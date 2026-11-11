import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReviewDriversComponent } from './view-review-drivers.component';

describe('ViewReviewDriversComponent', () => {
  let component: ViewReviewDriversComponent;
  let fixture: ComponentFixture<ViewReviewDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReviewDriversComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewReviewDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
