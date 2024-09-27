import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentAssetRecordComponent } from './current-asset-record.component';

describe('CurrentAssetRecordComponent', () => {
  let component: CurrentAssetRecordComponent;
  let fixture: ComponentFixture<CurrentAssetRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentAssetRecordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentAssetRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
