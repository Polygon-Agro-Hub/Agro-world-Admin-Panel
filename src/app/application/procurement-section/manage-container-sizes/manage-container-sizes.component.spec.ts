import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageContainerSizesComponent } from './manage-container-sizes.component';

describe('ManageContainerSizesComponent', () => {
  let component: ManageContainerSizesComponent;
  let fixture: ComponentFixture<ManageContainerSizesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageContainerSizesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageContainerSizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
