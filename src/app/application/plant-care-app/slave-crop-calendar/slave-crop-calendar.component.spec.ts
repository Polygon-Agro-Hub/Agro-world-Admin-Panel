import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaveCropCalendarComponent } from './slave-crop-calendar.component';

describe('SlaveCropCalendarComponent', () => {
  let component: SlaveCropCalendarComponent;
  let fixture: ComponentFixture<SlaveCropCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlaveCropCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SlaveCropCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
