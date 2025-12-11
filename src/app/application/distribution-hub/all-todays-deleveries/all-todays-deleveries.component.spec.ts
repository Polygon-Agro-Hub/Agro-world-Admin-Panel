import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTodaysDeleveriesComponent } from './all-todays-deleveries.component';

describe('AllTodaysDeleveriesComponent', () => {
  let component: AllTodaysDeleveriesComponent;
  let fixture: ComponentFixture<AllTodaysDeleveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTodaysDeleveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllTodaysDeleveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
