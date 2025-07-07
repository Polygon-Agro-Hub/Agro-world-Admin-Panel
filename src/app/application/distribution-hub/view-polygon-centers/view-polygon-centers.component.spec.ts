import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPolygonCentersComponent } from './view-polygon-centers.component';

describe('ViewPolygonCentersComponent', () => {
  let component: ViewPolygonCentersComponent;
  let fixture: ComponentFixture<ViewPolygonCentersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPolygonCentersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPolygonCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
