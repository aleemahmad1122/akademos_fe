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
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  imgUpload = "";
  imageSource = null;
  searchText = '';
  urllink: String;
  loader = false
  libraryForm = new FormGroup({
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
  libraryList = [];
  nolibrary = false;
  selection = '0'
  questionType = ''
  sectors: { name: string; }[];
  countries: { name: string; }[];

  constructor(
    private service: SurveyService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {
    this.getAllLibrary();
    this.sectors = sectors
    this.countries = countries
  }

  getAllLibrary() {
    this.loader = true
    this.service.libraryList().subscribe(data => {
      this.loader = false
      if (data.status == 1) {
        this.libraryList = data.data;
      }
    })
  }

  submitUser() {
    if (this.libraryForm.value._id == null) {
      this.createLibrary()
    }
  }

  createLibrary() {
    console.log(this.libraryForm)
    if (this.libraryForm.get('filter').value.to > this.libraryForm.get('filter').value.from || (this.libraryForm.get('filter').value.to == 0 && this.libraryForm.get('filter').value.from == 0 && this.libraryForm.get('filter').value.exactAge != 0)) {
      if (this.libraryForm.valid) {
        this.service.addLibrary(this.libraryForm.value).subscribe(data => {
          if (data.status == 1) {
            document.getElementById('close').click()
            this.getAllLibrary();
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




  delete(id) {
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
          this.service.updateLibrary({ _id: id, status: '-1' }).subscribe(data => {
            if (data.status == 1) {
              this.toastr.success('Library deleted successfully', 'Success !', {
                positionClass: 'toast-bottom-right'
              });
              this.getAllLibrary();
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
      if (this.libraryForm.get('filter').value.from != 0) {
        // this.libraryForm.get('filter').value.from = 0;
        // this.libraryForm.get('filter').value.to = 0;
        this.libraryForm.get('filter').reset({
          selectedGender: this.libraryForm.get('filter').value.selectedGender,
          from: this.libraryForm.get('filter').value.from,
          to: this.libraryForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else if (key == 'to') {
      if (this.libraryForm.get('filter').value.exactAge != 0) {
        // this.libraryForm.get('filter').value.from = 0;
        // this.libraryForm.get('filter').value.to = 0;
        this.libraryForm.get('filter').reset({
          selectedGender: this.libraryForm.get('filter').value.selectedGender,
          from: this.libraryForm.get('filter').value.from,
          to: this.libraryForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else {

      if (this.libraryForm.get('filter').value.exactAge != 0) {
        // this.libraryForm.get('filter').value.from = 0;
        // this.libraryForm.get('filter').value.to = 0;
        this.libraryForm.get('filter').reset({
          selectedGender: this.libraryForm.get('filter').value.selectedGender,
          from: 0,
          to: 0,
          exactAge: this.libraryForm.get('filter').value.exactAge
        })

      }
    }

  }
}
