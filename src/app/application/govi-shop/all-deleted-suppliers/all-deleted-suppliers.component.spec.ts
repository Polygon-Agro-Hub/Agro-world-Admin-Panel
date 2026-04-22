import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDeletedSuppliersComponent } from './all-deleted-suppliers.component';

describe('AllDeletedSuppliersComponent', () => {
  let component: AllDeletedSuppliersComponent;
  let fixture: ComponentFixture<AllDeletedSuppliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDeletedSuppliersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllDeletedSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
