import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPlacePremadePackagesComponent } from './market-place-premade-packages.component';

describe('MarketPlacePremadePackagesComponent', () => {
  let component: MarketPlacePremadePackagesComponent;
  let fixture: ComponentFixture<MarketPlacePremadePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPlacePremadePackagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketPlacePremadePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
