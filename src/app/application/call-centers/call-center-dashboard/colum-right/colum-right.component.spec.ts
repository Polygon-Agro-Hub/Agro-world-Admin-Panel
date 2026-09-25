import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumRightComponent } from './colum-right.component';

describe('ColumRightComponent', () => {
  let component: ColumRightComponent;
  let fixture: ComponentFixture<ColumRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumRightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColumRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
