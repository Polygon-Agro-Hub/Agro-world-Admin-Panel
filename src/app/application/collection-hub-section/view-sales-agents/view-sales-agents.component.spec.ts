import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSalesAgentsComponent } from './view-sales-agents.component';

describe('ViewSalesAgentsComponent', () => {
  let component: ViewSalesAgentsComponent;
  let fixture: ComponentFixture<ViewSalesAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSalesAgentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSalesAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
