import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewSalesAgentsComponent } from './preview-sales-agents.component';

describe('PreviewSalesAgentsComponent', () => {
  let component: PreviewSalesAgentsComponent;
  let fixture: ComponentFixture<PreviewSalesAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewSalesAgentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewSalesAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
