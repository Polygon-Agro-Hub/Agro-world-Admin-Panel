import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarvestStorageTabComponent } from './harvest-storage-tab.component';

describe('HarvestStorageTabComponent', () => {
  let component: HarvestStorageTabComponent;
  let fixture: ComponentFixture<HarvestStorageTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HarvestStorageTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HarvestStorageTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
