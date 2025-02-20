import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDailyTargetComponent } from './add-daily-target.component';

describe('AddDailyTargetComponent', () => {
  let component: AddDailyTargetComponent;
  let fixture: ComponentFixture<AddDailyTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDailyTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDailyTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
