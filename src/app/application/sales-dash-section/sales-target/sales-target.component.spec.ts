import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTargetComponent } from './sales-target.component';

describe('SalesTargetComponent', () => {
  let component: SalesTargetComponent;
  let fixture: ComponentFixture<SalesTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
