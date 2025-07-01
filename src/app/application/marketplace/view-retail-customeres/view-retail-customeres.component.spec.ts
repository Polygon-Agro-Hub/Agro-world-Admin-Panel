import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailCustomeresComponent } from './view-retail-customeres.component';

describe('ViewRetailCustomeresComponent', () => {
  let component: ViewRetailCustomeresComponent;
  let fixture: ComponentFixture<ViewRetailCustomeresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailCustomeresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailCustomeresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
