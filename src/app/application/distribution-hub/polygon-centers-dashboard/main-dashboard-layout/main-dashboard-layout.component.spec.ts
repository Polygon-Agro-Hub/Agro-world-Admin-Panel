import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDashboardLayoutComponent } from './main-dashboard-layout.component';

describe('MainDashboardLayoutComponent', () => {
  let component: MainDashboardLayoutComponent;
  let fixture: ComponentFixture<MainDashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainDashboardLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
