import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareCertificationAreaChartComponent } from './govicare-certification-area-chart.component';

describe('GovicareCertificationAreaChartComponent', () => {
  let component: GovicareCertificationAreaChartComponent;
  let fixture: ComponentFixture<GovicareCertificationAreaChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareCertificationAreaChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareCertificationAreaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
