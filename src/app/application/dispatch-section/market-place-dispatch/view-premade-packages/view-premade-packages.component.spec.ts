import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPremadePackagesComponent } from './view-premade-packages.component';

describe('ViewPremadePackagesComponent', () => {
  let component: ViewPremadePackagesComponent;
  let fixture: ComponentFixture<ViewPremadePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPremadePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPremadePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
