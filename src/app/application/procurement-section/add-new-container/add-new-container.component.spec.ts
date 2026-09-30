import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewContainerComponent } from './add-new-container.component';

describe('AddNewContainerComponent', () => {
  let component: AddNewContainerComponent;
  let fixture: ComponentFixture<AddNewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
