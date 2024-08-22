import { Component, ElementRef, NgZone, OnInit, ViewChild, inject } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { sectors } from 'app/shared/sectors';
import { countries } from 'app/shared/countries';
import { SurveyService } from 'app/service/survey.service';
import { MapsAPILoader } from '@agm/core';
import { dateNotBeforeToday } from 'app/date.validator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



declare var google: any;
@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss']
})





export class SurveyComponent {
  locationSearch: string = '';
  newItemNumber: number | null = null;
  items: { text: string; number: number }[] = [];
  user: any = JSON.parse(localStorage.getItem("admin"))
  dateInput = new FormControl('', [Validators.required, dateNotBeforeToday()]);
  radiusInput = new FormControl('', [Validators.required, Validators.min(500)]);
  pointsInput = new FormControl('', [Validators.required, Validators.min(1)]);
  strokeOpacity = 0.8;
  fillOpacity = 0.35;
  circleColor = 'red';


  map: any;
  markers: google.maps.Marker[] = [];

  drawingManager: any;

  imgUpload = "";
  imageSource = null;
  searchText = '';
  selectStatus = '';
  urllink: String;
  loader = false

  selectedStatus: string = '';
  radiusDiv = new FormGroup({
    radius: new FormControl()
  })
  radius = 0;
  surveyForm = new FormGroup({
    projectName: new FormControl('', Validators.required),
    desc: new FormControl(''),
    occupation: new FormControl(''),
    maritalStatus: new FormControl(''),
    minIncome: new FormControl(''),
    maxIncome: new FormControl(''),
    sector: new FormControl(null),
    country: new FormControl(null),
    filter: new FormGroup({
      from: new FormControl(0),
      to: new FormControl(0),
      exactAge: new FormControl(0),
      selectedGender: new FormControl('All'),
      location: new FormArray([]),
    }),
    expirationDate: new FormControl(''),
    points: new FormControl(0, Validators.required),
    question: new FormControl([]),
    status: new FormControl(this.user.role == "admin" ? '1' : '0')
  })
  error;
  fieldTextType: boolean;
  surveyList = [];
  nosurvey = false;
  selection = '0'
  questionType = ''
  sectors: { name: string; }[];
  countries: { name: string; }[];
  private geoCoder;
  @ViewChild("search", { static: false }) public searchElementRef: ElementRef;
  bounds = null;

  latitude: any;
  longitude: any;
  zoom: any;
  address: any;
  lat = 29.8146317;
  long = 69.3016234;

  selectedLocations: any = [];

  constructor(
    private service: SurveyService,
    private toastr: ToastrService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,

  ) { }

  updateItem(index: number, newNumber: number) {
    if (newNumber < 500) {
      this.toastr.error('Radius should be greater than 500', 'Error', {
        positionClass: 'toast-bottom-right'
      });
    } else {
      this.items[index].number = newNumber;

      this.selectedLocations[index].rad = newNumber;
      (this.locationsArr.at(index) as FormGroup).controls['radius'].setValue(newNumber);
    }

  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.selectedLocations.splice(index, 1);
    this.surveyForm.value.filter.location.splice(index, 1);
  }

  ngOnInit() {
    this.getAllSurvey();
    this.sectors = sectors
    this.countries = countries

    this.setMap()

  }

  onStatusChange() {
    if (this.selectedStatus) {
      this.getAllSurvey(this.selectedStatus);
    }
  }

  setMap() {
    try {
      setTimeout(() => {
        this.mapsAPILoader.load().then(() => {
          this.geoCoder = new google.maps.Geocoder();
          if (this.searchElementRef) {
            let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
            autocomplete.addListener("place_changed", () => {
              this.ngZone.run(() => {
                let place: google.maps.places.PlaceResult = autocomplete.getPlace();
                this.locationSearch = place.formatted_address || place.name;
                if (place.geometry === undefined || place.geometry === null) {
                  return;
                }
                var inputValue = (<HTMLInputElement>document.getElementById("radiusInputField")).value;
                this.radius = parseInt(inputValue);
                this.latitude = place.geometry.location.lat();
                this.longitude = place.geometry.location.lng();
                this.getAddress(this.latitude, this.longitude);
              });
            });
          }

        });
      }, 5000);
    } catch (e) {
      console.log(e, 'erro')
    }
  }

  addLocation() {
    if (this.radiusInput.valid) {

      if (this.locationSearch && this.newItemNumber !== null) {
        this.items.push({ text: this.locationSearch, number: this.newItemNumber });

      }

      for (let i = 0; i < this.selectedLocations.length; i++) {
        const el = this.selectedLocations[i];
        if (el.lat == this.latitude && el.long == this.longitude) {
          el.rad = this.radius
        }
      }
      for (let i = 0; i < this.locationsArr.controls.length; i++) {
        const el = this.locationsArr.controls[i];
        if (el.value.latitude == this.latitude && el.value.longitude == this.longitude) {
          el.value.radius = this.radius
        }
      }
      let ind = this.locationsArr.value.findIndex(e => e.latitude == this.latitude && e.longitude == this.longitude)
      if (ind == -1) {
        this.locationsArr.push(new FormGroup(
          {
            latitude: new FormControl(this.latitude),
            longitude: new FormControl(this.longitude),
            radius: new FormControl(this.radius),
            address: new FormControl(this.locationSearch)
          }
        ))
      }

      let obj = {
        lat: this.latitude,
        long: this.longitude,
        rad: this.radius
      }

      this.selectedLocations.push(obj)
    }


  }

  get locationsArr() {
    return (this.surveyForm.get('filter') as FormGroup).get('location') as FormArray
  }
  getAddress(latitude, longitude) {

    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
          this.lat = this.latitude;
          this.long = this.longitude;
        } else {

        }
      } else {

      }
    });
  }

  mapClicked($event) {
    // var eventLat = parseFloat($event['coords'].lat);
    // var eventLng = parseFloat($event['coords'].lng);
    // console.log(eventLat+" "+eventLng);

    // let obj1 = {
    //   latitude: eventLat,
    //   longitude: eventLng,
    //   radius: this.radius
    // }
    // let obj2 = {
    //   lat: eventLat,
    //   long: eventLng,
    //   rad: this.radius
    // }

    // this.selectedLocations.push(obj2);
    //   this.locationsArr.push(new FormGroup(
    //     {
    //       latitude:new FormControl(eventLat),
    //       longitude:new FormControl(eventLng),
    //       radius:new FormControl(this.radius)
    //     }
    //   ))
  }

  markerDragEnd($event: MouseEvent, lat, long) {

    var eventLat = parseFloat($event['coords'].lat);
    var eventLng = parseFloat($event['coords'].lng);

    let ind1 = this.selectedLocations.findIndex(e => e.lat == lat && e.long == long);

    if (this.selectedLocations.length != 0) {

      this.selectedLocations.splice(ind1, 1);
      this.locationsArr.removeAt(ind1);

      let obj1 = {
        latitude: eventLat,
        longitude: eventLng,
        radius: this.radius
      }
      let obj2 = {
        lat: eventLat,
        long: eventLng,
        rad: this.radius
      }

      this.selectedLocations.push(obj2);
      this.locationsArr.push(new FormGroup(
        {
          latitude: new FormControl(eventLat),
          longitude: new FormControl(eventLng),
          radius: new FormControl(this.radius)
        }
      ))

    }
  }
  removeMarker(lat, long) {
    // console.log(lat);
    // console.log(long);
    // let ind =this.selectedLocations.findIndex(e=>e.lat == lat && e.long == long);
    // if (ind != -1) {
    //   this.selectedLocations.splice(ind,1);
    //   this.surveyForm.value.filter.location.splice(ind,1)
    // }

  }

  getAllSurvey(status?: string) {
    this.loader = true
    this.service.surveyList(status).subscribe(data => {
      this.loader = false
      if (data.status == 1) {
        this.surveyList = data.data;
      }
    })
  }


  createSurvey() {
    const expirationDate = this.dateInput.value;
    this.surveyForm.controls['expirationDate'].setValue(expirationDate);

    const points = this.pointsInput.value;
    this.surveyForm.controls['points'].setValue(points);

    this.surveyForm.controls['expirationDate'].setValue(expirationDate);

    if (this.surveyForm.get('filter').value.to > this.surveyForm.get('filter').value.from || (this.surveyForm.get('filter').value.to == 0 && this.surveyForm.get('filter').value.from == 0 && this.surveyForm.get('filter').value.exactAge != 0)) {

      if (this.surveyForm.valid && this.dateInput.valid && this.pointsInput.valid) {

        if (this.selectedLocations.length > 0) {
          this.service.addSurvey(this.surveyForm.value).subscribe(data => {
            if (data.status == 1) {
              document.getElementById('close').click()
              this.getAllSurvey();
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
        } else {
          this.toastr.error('Choose at least one location', 'Error', {
            positionClass: 'toast-bottom-right'
          });
        }


      }
      else {
        this.toastr.error('Form Invalid data', 'Error', {
          positionClass: 'toast-bottom-right'
        });
      }
    } else {
      this.toastr.error('Invalid age or age range', 'Error', {
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
          this.service.updateSurvey(id, { status: '-1' }).subscribe(data => {
            if (data.status == 1) {
              this.toastr.success('Survey deleted successfully', 'Success !', {
                positionClass: 'toast-bottom-right'
              });
              this.getAllSurvey();
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
        this.surveyForm.get('filter').reset({
          selectedGender: this.surveyForm.get('filter').value.selectedGender,
          from: this.surveyForm.get('filter').value.from,
          to: this.surveyForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else if (key == 'to') {
      if (this.surveyForm.get('filter').value.exactAge != 0) {
        this.surveyForm.get('filter').reset({
          selectedGender: this.surveyForm.get('filter').value.selectedGender,
          from: this.surveyForm.get('filter').value.from,
          to: this.surveyForm.get('filter').value.to,
          exactAge: 0
        })

      }
    } else {

      if (this.surveyForm.get('filter').value.exactAge != 0) {
        this.surveyForm.get('filter').reset({
          selectedGender: this.surveyForm.get('filter').value.selectedGender,
          from: 0,
          to: 0,
          exactAge: this.surveyForm.get('filter').value.exactAge
        })

      }
    }

  }
  setRadius() {
    var inputValue = (<HTMLInputElement>document.getElementById("radiusInputField")).value;
    this.radius = parseInt(inputValue);
  }
  exportDataToExcel(data): void {
    this.loader = true
    // data._id = this.router.snapshot.params.id
    this.service.responseList(data._id).
      subscribe(data2 => {
        this.loader = false
        if (data2.status == 1) {
          var responsesList = data2.data;
          console.log(responsesList);
          console.log(responsesList[0].survey.question[0].answer);

          var jsonData = [
            { Project_Name: data.projectName, Description: data.desc, Country: data.country, Deadline: data.expirationDate, Points: data.points, Sector: data.sector, Gender: data.selectedGender, "From(Age)": data.filter.from, "To(Age)": data.filter.to, "Exact(Age)": data.filter.exactAge },
            // { name: 'Jane', age: 25, city: 'Los Angeles' },
            // { name: 'Doe', age: 40, city: 'Chicago' }
          ];

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

          // // Example: Inserting a title at A1
          // // XLSX.utils.sheet_add_aoa(worksheet, [['Sample Data']], {origin: 'A1'});

          // // Example: Inserting a header row at A3
          // // XLSX.utils.sheet_add_aoa(worksheet, [['Name', 'Age', 'City']], {origin: 'A3'});
          var colPos = 5;
          XLSX.utils.sheet_add_aoa(worksheet, [['LOCATIONS']], { origin: 'A' + (colPos) });
          colPos++;
          XLSX.utils.sheet_add_aoa(worksheet, [['latitude', 'longitude', 'radius']], { origin: 'B' + (colPos) });
          colPos++;

          for (let item of data.filter.location) {

            XLSX.utils.sheet_add_aoa(worksheet, [[item.latitude]], { origin: 'B' + (colPos) });
            XLSX.utils.sheet_add_aoa(worksheet, [[item.longitude]], { origin: 'C' + (colPos) });
            XLSX.utils.sheet_add_aoa(worksheet, [[item.radius]], { origin: 'D' + (colPos) });
            colPos++;
          }

          colPos++;
          XLSX.utils.sheet_add_aoa(worksheet, [['QUESTIONS']], { origin: 'A' + (colPos) });
          colPos++;

          var qNo = 1;
          for (let item of data.question) {
            XLSX.utils.sheet_add_aoa(worksheet, [["Q: " + qNo]], { origin: 'A' + (colPos) });
            XLSX.utils.sheet_add_aoa(worksheet, [[item.title]], { origin: 'B' + (colPos) });
            colPos++;
            if (item.key == "selectOne") {
              var i = 1;
              for (let item_ of item.options) {
                XLSX.utils.sheet_add_aoa(worksheet, [["op: " + i++]], { origin: 'B' + (colPos) });
                XLSX.utils.sheet_add_aoa(worksheet, [[item_.option]], { origin: 'C' + (colPos) });
                // if(item.answer==item_.option){
                //   XLSX.utils.sheet_add_aoa(worksheet, [["Selected"]], {origin: 'D'+(colPos)});
                // }
                colPos++;
              }

            } else if (item.key == "selectMany") {
              var i = 1;
              for (let item_ of item.options) {
                XLSX.utils.sheet_add_aoa(worksheet, [["op: " + i++]], { origin: 'B' + (colPos) });
                XLSX.utils.sheet_add_aoa(worksheet, [[item_.option]], { origin: 'C' + (colPos) });
                // if(item_.checked){
                //   XLSX.utils.sheet_add_aoa(worksheet, [["Selected"]], {origin: 'D'+(colPos)});
                // }
                colPos++;
              }

            } else if (item.key == "photo") {
              // XLSX.utils.sheet_add_aoa(worksheet, [["ANSWER"]], {origin: 'B'+(colPos)});
              // XLSX.utils.sheet_add_aoa(worksheet, [[item.img]], {origin: 'C'+(colPos)});
              // colPos++;
            } else if (item.key == "location") {
              // XLSX.utils.sheet_add_aoa(worksheet, [["ANSWER"]], {origin: 'B'+(colPos)});
              // XLSX.utils.sheet_add_aoa(worksheet, [["lat:"+item.answer[0]+" , long:"+item.answer[1]]], {origin: 'C'+(colPos)});
              // colPos++;
            } else {
              // XLSX.utils.sheet_add_aoa(worksheet, [["ANSWER"]], {origin: 'B'+(colPos)});
              // XLSX.utils.sheet_add_aoa(worksheet, [[item.answer]], {origin: 'C'+(colPos)});
              // colPos++;
            }
            qNo++;
            colPos++;
          }

          qNo = 1;
          var qNoCol = 3;
          console.log("for loop called");
          console.log(qNo);
          XLSX.utils.sheet_add_aoa(worksheet, [["S.No"]], { origin: (numberToExcelColumn(1)) + (colPos) });
          XLSX.utils.sheet_add_aoa(worksheet, [["Users"]], { origin: (numberToExcelColumn(2)) + (colPos) });
          for (let item of data.question) {
            console.log(qNo);
            console.log(numberToExcelColumn(qNo + 1) + (colPos));
            XLSX.utils.sheet_add_aoa(worksheet, [["Q: " + qNo]], { origin: (numberToExcelColumn(qNoCol)) + (colPos) });
            qNo++;
            qNoCol++;
          }

          colPos++;

          console.log("CAlled");
          console.log(responsesList);
          // console.log(responsesList[0].user.email);
          // console.log("CAlled");

          var y = 0;
          for (var i = 0; i < responsesList.length; i++) {
            XLSX.utils.sheet_add_aoa(worksheet, [[`${i + 1}`]], { origin: (numberToExcelColumn(1)) + (colPos) });
            XLSX.utils.sheet_add_aoa(worksheet, [[responsesList[i].user.email]], { origin: (numberToExcelColumn(2)) + (colPos) });
            for (var j = 0; j < responsesList[i].survey.question.length; j++) {
              if (responsesList[i].survey.question[j].key == "selectMany") {
                var answer = "";
                for (var k = 0; k < responsesList[i].survey.question[j].answer.length; k++) {
                  if (k != 0) {
                    answer = answer + ", " + responsesList[i].survey.question[j].answer[k];
                  } else {
                    answer = responsesList[i].survey.question[j].answer[k];
                  }
                }
                XLSX.utils.sheet_add_aoa(worksheet, [[answer]], { origin: (numberToExcelColumn(j + 3)) + (colPos) });
              } else if (responsesList[i].survey.question[j].key == "photo") {
                XLSX.utils.sheet_add_aoa(worksheet, [[responsesList[i].survey.question[j].img]], { origin: (numberToExcelColumn(j + 3)) + (colPos) });
              } else if (responsesList[i].survey.question[j].key == "location") {
                XLSX.utils.sheet_add_aoa(worksheet, [["lat:" + responsesList[i].survey.question[j].answer[0] + " , long:" + responsesList[i].survey.question[j].answer[1]]], { origin: (numberToExcelColumn(j + 3)) + (colPos) });
              } else {
                XLSX.utils.sheet_add_aoa(worksheet, [[responsesList[i].survey.question[j].answer]], { origin: (numberToExcelColumn(j + 3)) + (colPos) });
              }

            }
            colPos++;

          }



          const range = XLSX.utils.decode_range(worksheet['!ref']);


          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, 'sample');


        }
      })

  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }


}

function numberToExcelColumn(number: number): string {
  if (number <= 0) {
    throw new Error("Number must be a positive integer.");
  }

  let columnLabel = "";

  while (number > 0) {
    number--; // Adjust for 1-based indexing
    let remainder = number % 26;
    columnLabel = String.fromCharCode(65 + remainder) + columnLabel;
    number = Math.floor(number / 26);
  }

  return columnLabel;
}
