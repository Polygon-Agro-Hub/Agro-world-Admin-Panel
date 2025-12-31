import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CultivationInfoTabComponent } from './cultivation-info-tab.component';

describe('CultivationInfoTabComponent', () => {
  let component: CultivationInfoTabComponent;
  let fixture: ComponentFixture<CultivationInfoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CultivationInfoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CultivationInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
