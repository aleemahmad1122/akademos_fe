import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveydetailComponent } from './librarydetail.component';


describe('SurveysComponent', () => {
  let component: SurveydetailComponent;
  let fixture: ComponentFixture<SurveydetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveydetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveydetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
