import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovishopViewShopsComponent } from './govishop-view-shops.component';

describe('GovishopViewShopsComponent', () => {
  let component: GovishopViewShopsComponent;
  let fixture: ComponentFixture<GovishopViewShopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovishopViewShopsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovishopViewShopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
