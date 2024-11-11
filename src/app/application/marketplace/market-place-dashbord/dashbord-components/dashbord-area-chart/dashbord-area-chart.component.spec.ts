import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordAreaChartComponent } from './dashbord-area-chart.component';

describe('DashbordAreaChartComponent', () => {
  let component: DashbordAreaChartComponent;
  let fixture: ComponentFixture<DashbordAreaChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordAreaChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashbordAreaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
