import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServicesComponent } from './edit-services.component';

describe('EditServicesComponent', () => {
  let component: EditServicesComponent;
  let fixture: ComponentFixture<EditServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditServicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
