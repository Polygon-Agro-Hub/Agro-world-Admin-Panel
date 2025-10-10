import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewServicesListComponent } from './view-services-list.component';

describe('ViewServicesListComponent', () => {
  let component: ViewServicesListComponent;
  let fixture: ComponentFixture<ViewServicesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewServicesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewServicesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
