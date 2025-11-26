import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionRangeComponent } from './commission-range.component';

describe('CommissionRangeComponent', () => {
  let component: CommissionRangeComponent;
  let fixture: ComponentFixture<CommissionRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionRangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommissionRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
