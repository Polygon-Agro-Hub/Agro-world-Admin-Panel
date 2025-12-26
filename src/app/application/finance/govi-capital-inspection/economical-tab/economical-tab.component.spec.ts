import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EconomicalTabComponent } from './economical-tab.component';

describe('EconomicalTabComponent', () => {
  let component: EconomicalTabComponent;
  let fixture: ComponentFixture<EconomicalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EconomicalTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EconomicalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
