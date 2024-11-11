import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketPlaceDashbordComponent } from './market-place-dashbord.component';


describe('MarketPlaceDashbordComponent', () => {
  let component: MarketPlaceDashbordComponent;
  let fixture: ComponentFixture<MarketPlaceDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPlaceDashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketPlaceDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
