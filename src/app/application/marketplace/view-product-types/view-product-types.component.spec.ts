import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductTypesComponent } from './view-product-types.component';

describe('ViewProductTypesComponent', () => {
  let component: ViewProductTypesComponent;
  let fixture: ComponentFixture<ViewProductTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProductTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewProductTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
