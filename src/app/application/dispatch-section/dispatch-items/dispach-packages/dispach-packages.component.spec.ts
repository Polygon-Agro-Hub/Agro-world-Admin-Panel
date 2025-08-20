import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispachPackagesComponent } from './dispach-packages.component';

describe('DispachPackagesComponent', () => {
  let component: DispachPackagesComponent;
  let fixture: ComponentFixture<DispachPackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispachPackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DispachPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
