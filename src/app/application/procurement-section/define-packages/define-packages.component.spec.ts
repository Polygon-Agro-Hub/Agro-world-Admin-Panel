import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinePackagesComponent } from './define-packages.component';

describe('DefinePackagesComponent', () => {
  let component: DefinePackagesComponent;
  let fixture: ComponentFixture<DefinePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefinePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefinePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
