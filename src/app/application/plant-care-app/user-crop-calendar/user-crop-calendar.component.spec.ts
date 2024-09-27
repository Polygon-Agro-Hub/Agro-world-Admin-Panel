import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCropCalendarComponent } from './user-crop-calendar.component';

describe('UserCropCalendarComponent', () => {
  let component: UserCropCalendarComponent;
  let fixture: ComponentFixture<UserCropCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCropCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserCropCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
