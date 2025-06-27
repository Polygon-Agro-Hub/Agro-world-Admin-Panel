import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompleatedDefinePremadePackagesComponent } from './edit-compleated-define-premade-packages.component';

describe('EditCompleatedDefinePremadePackagesComponent', () => {
  let component: EditCompleatedDefinePremadePackagesComponent;
  let fixture: ComponentFixture<EditCompleatedDefinePremadePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompleatedDefinePremadePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCompleatedDefinePremadePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
