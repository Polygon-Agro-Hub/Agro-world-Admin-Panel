import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPackingTargetComponent } from './daily-packing-target.component';

describe('DailyPackingTargetComponent', () => {
  let component: DailyPackingTargetComponent;
  let fixture: ComponentFixture<DailyPackingTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyPackingTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailyPackingTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
