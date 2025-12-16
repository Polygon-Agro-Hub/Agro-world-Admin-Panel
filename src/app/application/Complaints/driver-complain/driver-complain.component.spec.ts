import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverComplainComponent } from './driver-complain.component';

describe('DriverComplainComponent', () => {
  let component: DriverComplainComponent;
  let fixture: ComponentFixture<DriverComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
