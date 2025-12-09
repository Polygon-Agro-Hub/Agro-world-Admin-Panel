import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverRowComponent } from './driver-row.component';

describe('DriverRowComponent', () => {
  let component: DriverRowComponent;
  let fixture: ComponentFixture<DriverRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
