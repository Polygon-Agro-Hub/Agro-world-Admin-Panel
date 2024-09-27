import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCropCalenderAddDaysComponent } from './create-crop-calender-add-days.component';

describe('CreateCropCalenderAddDaysComponent', () => {
  let component: CreateCropCalenderAddDaysComponent;
  let fixture: ComponentFixture<CreateCropCalenderAddDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCropCalenderAddDaysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCropCalenderAddDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
