import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysDeliveriesComponent } from './todays-deliveries.component';

describe('TodaysDeliveriesComponent', () => {
  let component: TodaysDeliveriesComponent;
  let fixture: ComponentFixture<TodaysDeliveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaysDeliveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodaysDeliveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
