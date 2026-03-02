import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGovishopSupliersComponent } from './view-govishop-supliers.component';

describe('ViewGovishopSupliersComponent', () => {
  let component: ViewGovishopSupliersComponent;
  let fixture: ComponentFixture<ViewGovishopSupliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGovishopSupliersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewGovishopSupliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
