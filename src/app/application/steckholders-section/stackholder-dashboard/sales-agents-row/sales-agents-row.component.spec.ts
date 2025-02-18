import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentsRowComponent } from './sales-agents-row.component';

describe('SalesAgentsRowComponent', () => {
  let component: SalesAgentsRowComponent;
  let fixture: ComponentFixture<SalesAgentsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentsRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesAgentsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
