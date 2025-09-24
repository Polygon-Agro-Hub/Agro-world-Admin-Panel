import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashPredefinePackagesComponent } from './dash-predefine-packages.component';

describe('DashPredefinePackagesComponent', () => {
  let component: DashPredefinePackagesComponent;
  let fixture: ComponentFixture<DashPredefinePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashPredefinePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashPredefinePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
