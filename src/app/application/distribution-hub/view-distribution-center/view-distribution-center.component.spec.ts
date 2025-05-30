import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDistributionCenterComponent } from './view-distribution-center.component';

describe('ViewDistributionCenterComponent', () => {
  let component: ViewDistributionCenterComponent;
  let fixture: ComponentFixture<ViewDistributionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDistributionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDistributionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
