import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveredTodaysDeleveriesComponent } from './delivered-todays-deleveries.component';

describe('DeliveredTodaysDeleveriesComponent', () => {
  let component: DeliveredTodaysDeleveriesComponent;
  let fixture: ComponentFixture<DeliveredTodaysDeleveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveredTodaysDeleveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliveredTodaysDeleveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
