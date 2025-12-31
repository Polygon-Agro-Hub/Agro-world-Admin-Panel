import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnTodaysDeleveriesComponent } from './return-todays-deleveries.component';

describe('ReturnTodaysDeleveriesComponent', () => {
  let component: ReturnTodaysDeleveriesComponent;
  let fixture: ComponentFixture<ReturnTodaysDeleveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnTodaysDeleveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnTodaysDeleveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
