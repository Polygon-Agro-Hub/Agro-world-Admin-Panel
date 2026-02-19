import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CultivationHistoryComponent } from './cultivation-history.component';

describe('CultivationHistoryComponent', () => {
  let component: CultivationHistoryComponent;
  let fixture: ComponentFixture<CultivationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CultivationHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CultivationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
