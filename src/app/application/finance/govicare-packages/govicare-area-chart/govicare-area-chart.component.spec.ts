import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareAreaChartComponent } from './govicare-area-chart.component';

describe('GovicareAreaChartComponent', () => {
  let component: GovicareAreaChartComponent;
  let fixture: ComponentFixture<GovicareAreaChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareAreaChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareAreaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
