import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnTheWayTodaysDeleveriesComponent } from './on-the-way-todays-deleveries.component';

describe('OnTheWayTodaysDeleveriesComponent', () => {
  let component: OnTheWayTodaysDeleveriesComponent;
  let fixture: ComponentFixture<OnTheWayTodaysDeleveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnTheWayTodaysDeleveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnTheWayTodaysDeleveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
