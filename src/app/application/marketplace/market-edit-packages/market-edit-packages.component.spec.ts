import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketEditPackagesComponent } from './market-edit-packages.component';

describe('MarketEditPackagesComponent', () => {
  let component: MarketEditPackagesComponent;
  let fixture: ComponentFixture<MarketEditPackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketEditPackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketEditPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
