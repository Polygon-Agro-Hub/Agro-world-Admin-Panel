import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovilinkServicesDashboardComponent } from './govilink-services-dashboard.component';

describe('GovilinkServicesDashboardComponent', () => {
  let component: GovilinkServicesDashboardComponent;
  let fixture: ComponentFixture<GovilinkServicesDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovilinkServicesDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GovilinkServicesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
