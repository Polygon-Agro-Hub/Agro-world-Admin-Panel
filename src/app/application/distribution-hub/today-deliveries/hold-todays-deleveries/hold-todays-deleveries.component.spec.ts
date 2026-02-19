import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldTodaysDeleveriesComponent } from './hold-todays-deleveries.component';

describe('HoldTodaysDeleveriesComponent', () => {
  let component: HoldTodaysDeleveriesComponent;
  let fixture: ComponentFixture<HoldTodaysDeleveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldTodaysDeleveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HoldTodaysDeleveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
