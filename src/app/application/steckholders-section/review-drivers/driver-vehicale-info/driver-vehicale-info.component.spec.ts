import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverVehicaleInfoComponent } from './driver-vehicale-info.component';

describe('DriverVehicaleInfoComponent', () => {
  let component: DriverVehicaleInfoComponent;
  let fixture: ComponentFixture<DriverVehicaleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverVehicaleInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverVehicaleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
