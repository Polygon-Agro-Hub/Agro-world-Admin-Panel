import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllShopsComponent } from './view-all-shops.component';

describe('ViewAllShopsComponent', () => {
  let component: ViewAllShopsComponent;
  let fixture: ComponentFixture<ViewAllShopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllShopsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllShopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
