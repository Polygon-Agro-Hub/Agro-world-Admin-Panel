import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintsDashbordComponent } from './complaints-dashbord.component';

describe('ComplaintsDashbordComponent', () => {
  let component: ComplaintsDashbordComponent;
  let fixture: ComponentFixture<ComplaintsDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintsDashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplaintsDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
