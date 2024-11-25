import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBulkUploadComponent } from './user-bulk-upload.component';

describe('UserBulkUploadComponent', () => {
  let component: UserBulkUploadComponent;
  let fixture: ComponentFixture<UserBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBulkUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
