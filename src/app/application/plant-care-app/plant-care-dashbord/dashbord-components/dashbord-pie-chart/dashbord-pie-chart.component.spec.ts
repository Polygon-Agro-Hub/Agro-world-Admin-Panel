import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordPieChartComponent } from './dashbord-pie-chart.component';

describe('DashbordPieChartComponent', () => {
  let component: DashbordPieChartComponent;
  let fixture: ComponentFixture<DashbordPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordPieChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashbordPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
