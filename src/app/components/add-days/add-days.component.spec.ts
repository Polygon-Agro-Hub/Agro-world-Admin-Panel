import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDaysComponent } from './add-days.component';

describe('AddDaysComponent', () => {
  let component: AddDaysComponent;
  let fixture: ComponentFixture<AddDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDaysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
