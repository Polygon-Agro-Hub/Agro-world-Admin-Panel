import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversAndVehiclesComponent } from './drivers-and-vehicles.component';

describe('DriversAndVehiclesComponent', () => {
  let component: DriversAndVehiclesComponent;
  let fixture: ComponentFixture<DriversAndVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriversAndVehiclesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriversAndVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
