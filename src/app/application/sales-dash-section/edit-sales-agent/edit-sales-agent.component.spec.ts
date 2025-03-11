import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSalesAgentComponent } from './edit-sales-agent.component';

describe('EditSalesAgentComponent', () => {
  let component: EditSalesAgentComponent;
  let fixture: ComponentFixture<EditSalesAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSalesAgentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSalesAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
