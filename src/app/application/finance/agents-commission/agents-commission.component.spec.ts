import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsCommissionComponent } from './agents-commission.component';

describe('AgentsCommissionComponent', () => {
  let component: AgentsCommissionComponent;
  let fixture: ComponentFixture<AgentsCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsCommissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgentsCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
