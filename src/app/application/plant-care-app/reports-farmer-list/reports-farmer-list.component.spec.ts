import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsFarmerListComponent } from './reports-farmer-list.component';

describe('ReportsFarmerListComponent', () => {
  let component: ReportsFarmerListComponent;
  let fixture: ComponentFixture<ReportsFarmerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsFarmerListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsFarmerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
