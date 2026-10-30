import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentRatingsComponent } from './sales-agent-ratings.component';

describe('SalesAgentRatingsComponent', () => {
  let component: SalesAgentRatingsComponent;
  let fixture: ComponentFixture<SalesAgentRatingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentRatingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesAgentRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
