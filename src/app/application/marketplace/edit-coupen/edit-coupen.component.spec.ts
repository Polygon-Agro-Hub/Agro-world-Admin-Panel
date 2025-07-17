import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoupenComponent } from './edit-coupen.component';

describe('EditCoupenComponent', () => {
  let component: EditCoupenComponent;
  let fixture: ComponentFixture<EditCoupenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCoupenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCoupenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
