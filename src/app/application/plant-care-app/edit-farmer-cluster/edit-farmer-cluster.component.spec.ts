import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditFarmerClusterComponent } from './edit-farmer-cluster.component';

describe('EditFarmerClusterComponent', () => {
  let component: EditFarmerClusterComponent;
  let fixture: ComponentFixture<EditFarmerClusterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFarmerClusterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditFarmerClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
