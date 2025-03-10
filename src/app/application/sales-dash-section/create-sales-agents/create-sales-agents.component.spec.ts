import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalesAgentsComponent } from './create-sales-agents.component';

describe('CreateSalesAgentsComponent', () => {
  let component: CreateSalesAgentsComponent;
  let fixture: ComponentFixture<CreateSalesAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSalesAgentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSalesAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
