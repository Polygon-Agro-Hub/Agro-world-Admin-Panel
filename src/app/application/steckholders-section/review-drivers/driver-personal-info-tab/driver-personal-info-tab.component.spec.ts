import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverPersonalInfoTabComponent } from './driver-personal-info-tab.component';

describe('DriverPersonalInfoTabComponent', () => {
  let component: DriverPersonalInfoTabComponent;
  let fixture: ComponentFixture<DriverPersonalInfoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverPersonalInfoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverPersonalInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
