import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoupenComponent } from './add-coupen.component';

describe('AddCoupenComponent', () => {
  let component: AddCoupenComponent;
  let fixture: ComponentFixture<AddCoupenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCoupenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCoupenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
