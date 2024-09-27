import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentAssetsViewComponent } from './current-assets-view.component';

describe('CurrentAssetsViewComponent', () => {
  let component: CurrentAssetsViewComponent;
  let fixture: ComponentFixture<CurrentAssetsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentAssetsViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentAssetsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
