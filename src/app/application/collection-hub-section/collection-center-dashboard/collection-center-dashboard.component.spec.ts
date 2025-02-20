import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCenterDashboardComponent } from './collection-center-dashboard.component';

describe('CollectionCenterDashboardComponent', () => {
  let component: CollectionCenterDashboardComponent;
  let fixture: ComponentFixture<CollectionCenterDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionCenterDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionCenterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
