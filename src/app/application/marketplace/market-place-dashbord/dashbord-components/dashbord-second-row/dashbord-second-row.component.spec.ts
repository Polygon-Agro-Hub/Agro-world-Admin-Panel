import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordSecondRowComponent } from './dashbord-second-row.component';

describe('DashbordSecondRowComponent', () => {
  let component: DashbordSecondRowComponent;
  let fixture: ComponentFixture<DashbordSecondRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordSecondRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashbordSecondRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
