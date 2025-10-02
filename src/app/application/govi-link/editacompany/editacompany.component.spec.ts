import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditacompanyComponent } from './editacompany.component';

describe('EditacompanyComponent', () => {
  let component: EditacompanyComponent;
  let fixture: ComponentFixture<EditacompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditacompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditacompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
