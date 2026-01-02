import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayDeliveriesViewDetailsPopupComponent } from './today-deliveries-view-details-popup.component';

describe('TodayDeliveriesViewDetailsPopupComponent', () => {
  let component: TodayDeliveriesViewDetailsPopupComponent;
  let fixture: ComponentFixture<TodayDeliveriesViewDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayDeliveriesViewDetailsPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodayDeliveriesViewDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
