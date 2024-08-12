import { Component, OnInit, inject } from '@angular/core';


import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminService } from 'app/service/admin.service';
import { sectors } from 'app/shared/sectors';
import { countries } from 'app/shared/countries';
import { SurveyService } from 'app/service/survey.service';
@Component({
  selector: 'app-user-response',
  templateUrl: './user-response.component.html',
  styleUrls: ['./user-response.component.scss']
})
export class UserresponseComponent implements OnInit {

  imgUpload = "";
  imageSource = null;
  searchText = '';
  urllink: String;
  loader = false
  surveyForm = new FormGroup({
    projectName: new FormControl('', Validators.required),
    desc: new FormControl(''),
    sector: new FormControl(null),
    country: new FormControl(null),
    filter: new FormGroup({
      from: new FormControl(0),
      to: new FormControl(0),
      exactAge: new FormControl(0),
      selectedGender: new FormControl('All')

    }),
    points: new FormControl(Validators.required),
    question: new FormControl([]),
    status: new FormControl('1')
  })
  error;
  fieldTextType: boolean;
  surveyList = [];
  nosurvey = false;
  selection = '0'
  questionType = ''
  sectors: { name: string; }[];
  countries: { name: string; }[];
  id: any;

  constructor(
    private service: SurveyService,
    private toastr: ToastrService,
    private router: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.getAllUserResponses();
    this.sectors = sectors
    this.countries = countries
  }

  getAllUserResponses() {
    this.loader = true
    this.id = this.router.snapshot.params.id
    this.service.responseList(this.id).
      subscribe(data => {
        this.loader = false
        if (data.status == 1) {
          this.surveyList = data.data;
        }
      })
  }

  submitUser() {
    if (this.surveyForm.value._id == null) {
      this.createSurvey()
    }
  }

  createSurvey() {
    console.log(this.surveyForm)
    if (this.surveyForm.get('filter').value.to > this.surveyForm.get('filter').value.from || (this.surveyForm.get('filter').value.to == 0 && this.surveyForm.get('filter').value.from == 0 && this.surveyForm.get('filter').value.exactAge != 0)) {
      if (this.surveyForm.valid) {
        this.service.addSurvey(this.surveyForm.value).subscribe(data => {
          if (data.status == 1) {
            document.getElementById('close').click()
            this.getAllUserResponses();
            this.toastr.success('User added successfully', 'Success !', {
              positionClass: 'toast-bottom-right'
            });
          }
          else {
            this.toastr.error(data.message, 'Error', {
              positionClass: 'toast-bottom-right'
            });
          }
        })
      }
      else {
        this.toastr.error('Form Invalid', 'Error', {
          positionClass: 'toast-bottom-right'
        });
      }
    } else {
      this.toastr.error('Ending age (to) cannot be more than starting age (from) ', 'Error', {
        positionClass: 'toast-bottom-right'
      })
    }
  }




  deleteSurvey(id) {
    swal("Are you sure, you want to delete it?", {
      buttons: {
        catch: {
          text: "No",
          value: "catch",
        },
        yes: true
      },
    })
      .then((value) => {
        if (value == 'yes') {
          this.service.updateUserResponse(id, { status: '-1' }).subscribe(data => {
            if (data.status == 1) {
              this.toastr.success('Survey deleted successfully', 'Success !', {
                positionClass: 'toast-bottom-right'
              });
              this.getAllUserResponses();
            }
            else {
              this.toastr.error('', 'Something Went Wrong', {
                positionClass: 'toast-bottom-right'
              });
            }
          })
        }
      });
  }

  valuechange(event, key) {
    if (key == 'from') {
      if (this.surveyForm.get('filter').value.from != 0) {
        // this.surveyForm.get('filter').value.from = 0;
        // this.surveyForm.get('filter').value.to = 0;
        this.surveyForm.get('filter').reset({
          selectedGender: this.surveyForm.get('filter').value.selectedGender,
          from: this.surveyForm.get('filter').value.from,
          to: this.surveyForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else if (key == 'to') {
      if (this.surveyForm.get('filter').value.exactAge != 0) {
        // this.surveyForm.get('filter').value.from = 0;
        // this.surveyForm.get('filter').value.to = 0;
        this.surveyForm.get('filter').reset({
          selectedGender: this.surveyForm.get('filter').value.selectedGender,
          from: this.surveyForm.get('filter').value.from,
          to: this.surveyForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else {

      if (this.surveyForm.get('filter').value.exactAge != 0) {
        // this.surveyForm.get('filter').value.from = 0;
        // this.surveyForm.get('filter').value.to = 0;
        this.surveyForm.get('filter').reset({
          selectedGender: this.surveyForm.get('filter').value.selectedGender,
          from: 0,
          to: 0,
          exactAge: this.surveyForm.get('filter').value.exactAge
        })

      }
    }

  }
}
