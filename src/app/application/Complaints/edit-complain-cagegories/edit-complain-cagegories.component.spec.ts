import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditComplainCagegoriesComponent } from './edit-complain-cagegories.component';

describe('EditComplainCagegoriesComponent', () => {
  let component: EditComplainCagegoriesComponent;
  let fixture: ComponentFixture<EditComplainCagegoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditComplainCagegoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditComplainCagegoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
