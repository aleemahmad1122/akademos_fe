import { Component, OnInit, inject, Renderer2, ElementRef, QueryList, ViewChildren, ViewChild, NgZone } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'app/service/admin.service';
import { countries } from 'app/shared/countries';
import { sectors } from 'app/shared/sectors';
import { SurveyService } from 'app/service/survey.service';
import { SingleSelect } from 'app/shared/typesOfQuestions';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { MapsAPILoader } from '@agm/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-surveydetail',
  templateUrl: './surveydetail.component.html',
  styleUrls: ['./surveydetail.component.scss']
})
export class SurveydetailComponent implements OnInit {
  items: { text: string; number: number }[] = [];
  user: any = JSON.parse(localStorage.getItem("admin"))
  newItemNumber: number | null = null;
  radiusInput = new FormControl('', [Validators.required, Validators.min(500)]);
  radiusInputField = document.getElementById("radiusInputField");
  radius = 0;
  strokeOpacity = 0.8;
  fillOpacity = 0.35;
  circleColor = 'red';
  map: any;
  locationSearch = '';
  loader = false

  radiusDiv = new FormGroup({
    radius: new FormControl()
  })

  addQuestion = false;
  surveyList = [];
  title = new FormControl('');
  selectedKey = ''
  private geoCoder;
  lat = 29.8146317;
  long = 69.3016234;
  sectors: { name: string; }[];
  countries: { name: string; }[];
  _id: string;
  selectedIndex: number;
  questionKeys: any = [
    { name: 'Select One', key: 'selectOne' },
    { name: 'Select Many', key: 'selectMany' },
    { name: 'Text', key: 'text', },
    { name: 'Number', key: 'number', },
    { name: 'Location', key: 'location', },
    { name: 'Photo', key: 'photo', },
    { name: 'Rating', key: 'rating', },
    { name: 'Date & Time', key: 'datetime', },
  ];





  operations = [
    { operation: 'null', value: 'Is not answered' },
    { operation: '!null', value: 'Is answered' },
    { operation: '=', value: '=' },
    { operation: '!=', value: '!=' }
  ]
  finalOperations = [
    { operation: 'null', value: 'Is not answered' },
    { operation: '!null', value: 'Is answered' },
    { operation: '=', value: '=' },
    { operation: '!=', value: '!=' }
  ]

  showQuesObj = {
    questionTitle: '',
    operation: 'pleaseselect',
    answer: 'null'
  }
  skipLogic = {
    questionTitle: 'pleaseselect',
    operation: 'pleaseselect',
    answer: 'pleaseselect',
    questionIndex: null
  }
  addSubQuestionBool: boolean = false;
  surveyForm = {
    projectName: null,
    desc: '',
    expirationDate: '',
    sector: null,
    country: null,
    points: null,
    status: 0,
    filter: {
      from: 0,
      to: 0,
      selectedGender: 'All',
      exactAge: 0,
      location: [],
    },
    question: [],
  }

  base64Image: string | null = null;
  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;
  triggerFileInput(index: number) {
    this.fileInputs.toArray()[index].nativeElement.click();
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.surveyForm.question[index].image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.surveyForm.question[index].image = "";
  }




  isDateInvalid = false;

  pointsInvalid = false;
  validatePoints(points: any) {
    this.pointsInvalid = points.invalid && (points.dirty || points.touched);
  }

  checkExpirationDate(dateString: string): void {
    const today = new Date();
    const inputDate = new Date(dateString);

    // Clear time part of the date objects to compare only the date part
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    this.isDateInvalid = inputDate < today;
  }

  selectedQuestion: any;
  isEdit: string = '';
  answer: boolean;
  questionIndex: number;
  skipLogicAnswerArray: any;
  skipLogicFilterQuesArray: any[];

  BAG = "DRAGULA_EVENTS";
  subs = new Subscription();

  @ViewChild("search", { static: false }) public searchElementRef: ElementRef;

  latitude: any;
  longitude: any;
  zoom: any;
  address: any;



  selectedLocations: any = [];


  constructor(
    private toastr: ToastrService,
    private appService: SurveyService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private elRef: ElementRef, private renderer: Renderer2,
    private dragulaService: DragulaService,
    private ngZone: NgZone,
  ) {

    this.subs.add(

      this.dragulaService.drop("dragulaActivityId").subscribe(({ name, el }) => {
        console.log('somthing')
      })

    )

  }






  ngOnInit() {
    this.getData();

  }

  updateItem(index: number, newNumber: number) {
    if (newNumber < 500) {
      this.toastr.error('Radius should be greater than 500', 'Error', {
        positionClass: 'toast-bottom-right'
      });
    } else {
      this.items[index].number = newNumber;

      this.selectedLocations[index].rad = newNumber;
      this.locationsArr[index].radius = newNumber;
    }

  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.selectedLocations.splice(index, 1);
    this.surveyForm.filter.location.splice(index, 1);
  }

  exportDataToExcel(): void {
    console.log(this.surveyForm);
    var jsonData = [
      { Project_Name: this.surveyForm.projectName, Description: this.surveyForm.desc, Country: this.surveyForm.country, Deadline: this.surveyForm.expirationDate, Points: this.surveyForm.points, Sector: this.surveyForm.sector },
      // { name: 'Jane', age: 25, city: 'Los Angeles' },
      // { name: 'Doe', age: 40, city: 'Chicago' }
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

    // Example: Inserting a title at A1
    // XLSX.utils.sheet_add_aoa(worksheet, [['Sample Data']], {origin: 'A1'});

    // Example: Inserting a header row at A3
    // XLSX.utils.sheet_add_aoa(worksheet, [['Name', 'Age', 'City']], {origin: 'A3'});

    XLSX.utils.sheet_add_aoa(worksheet, [['QUESTIONS']], { origin: 'A4' });

    // for(var i=0;i<=this.surveyForm.question.length;i++){
    //   console.log("called");
    //   console.log(this.surveyForm.question.find(item => item. === ));
    //   XLSX.utils.sheet_add_aoa(worksheet, [[this.surveyForm.question[i]]], {origin: 'A'+(5+1)});
    // }
    var i = 0;
    var position = 'A';
    for (let item of this.surveyForm.question) {
      console.log(item.title);
      XLSX.utils.sheet_add_aoa(worksheet, [[item.title]], { origin: 'A' + (5 + i) });
      i++;
    }


    // Example: Inserting data starting from B4
    const range = XLSX.utils.decode_range(worksheet['!ref']);


    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'sample');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }

  setMap() {
    console.log(this.surveyForm);

    try {

      setTimeout(() => {
        this.mapsAPILoader.load().then(() => {
          this.geoCoder = new google.maps.Geocoder();
          if (this.surveyForm.filter.location.length != 0) {
            for (const data of this.surveyForm.filter.location) {

              let obj = {
                lat: data.latitude,
                long: data.longitude,
                rad: data.radius
              }
              this.lat = data.latitude;
              this.long = data.longitude;

              this.items.push({ text: data.address, number: data.radius });
              this.locationSearch = '';
              this.newItemNumber = null;


              this.selectedLocations.push(obj)

            }
          }

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
      for (let i = 0; i < this.locationsArr.length; i++) {
        const el = this.locationsArr[i];
        if (el.latitude == this.latitude && el.longitude == this.longitude) {
          el.radius = this.radius
        }
      }
      let ind = this.locationsArr.findIndex(e => e.latitude == this.latitude && e.longitude == this.longitude)
      if (ind == -1) {
        this.locationsArr.push(
          {
            latitude: this.latitude,
            longitude: this.longitude,
            radius: this.radius,
            address: this.locationSearch
          }
        )
      }

      let obj = {
        lat: this.latitude,
        long: this.longitude,
        rad: this.radius
      }


      this.selectedLocations.push(obj)
    }

  }
  mapClicked($event) {
    var eventLat = parseFloat($event['coords'].lat);
    var eventLng = parseFloat($event['coords'].lng);
    console.log(eventLat + " " + eventLng);

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

    this.surveyForm.filter.location.push(obj1);
    this.selectedLocations.push(obj2);
  }

  markerDragEnd($event: MouseEvent, lat, long) {
    var eventLat = parseFloat($event['coords'].lat);
    var eventLng = parseFloat($event['coords'].lng);

    console.log(lat + " " + long);
    console.log(eventLat + " " + eventLng);
    let ind = this.selectedLocations.findIndex(e => e.lat == lat && e.long == long);
    console.log(ind);
    if (ind != -1) {
      this.selectedLocations.splice(ind, 1);
      this.surveyForm.filter.location.splice(ind, 1)

      console.log(this.surveyForm);
      console.log(this.selectedLocations);
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

      this.surveyForm.filter.location.push(obj1);
      this.selectedLocations.push(obj2);
      console.log(this.surveyForm);
      console.log(this.selectedLocations);

    }
  }
  removeMarker(lat, long) {
    console.log(lat);
    console.log(long);
    let ind = this.selectedLocations.findIndex(e => e.lat == lat && e.long == long);
    if (ind != -1) {
      this.selectedLocations.splice(ind, 1);
      this.surveyForm.filter.location.splice(ind, 1)
    }

  }

  get locationsArr() {
    return (this.surveyForm.filter.location)
  }
  getAddress(latitude, longitude) {

    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results, status, 'response===>')
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

  setRadius() {
    var inputValue = (<HTMLInputElement>document.getElementById("radiusInputField")).value;
    this.radius = parseInt(inputValue);
  }

  getData() {
    this.isEdit = this.route.snapshot.params.isEdit
    this.sectors = sectors
    this.countries = countries
    this.getServeyById()
  }

  getServeyById() {
    let questions = new SingleSelect(this.fb)
    this.loader = true
    this._id = this.route.snapshot.params._id
    this.appService.getSurveyById(this._id).subscribe(data => {
      this.loader = false
      if (data.status == 1) {
        this.surveyForm = data.data;

        // setting date to date picker
        console.log(this.surveyForm);
        this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");


        this.setMap();
        if (this.isEdit == 'false') {

        }
      }
    })
  }

  openSetting(i) {
    this.selectedIndex = i;
    this.selectedQuestion = this.surveyForm.question[this.selectedIndex]
  }

  removeQuestion(i) {
    this.surveyForm.question.splice(i, 1)
  }

  removeSubQuestion(k) {
    this.surveyForm.question[this.selectedIndex].subQuestion.splice(k, 1)
  }

  addNewFieldOption(i, k) {
    if (this.surveyForm.question[i].key == 'selectMany') {
      this.surveyForm.question[i].options.push({
        option: '',
        checked: false,
      });

    } else {
      this.surveyForm.question[i].options.push({
        option: '',
      });

    }
  }
  addNewSubQuesFieldOption(k) {
    if (this.selectedQuestion.subQuestion[k].key == 'selectMany') {

      this.selectedQuestion.subQuestion[k].options.push({
        option: '',
        checked: false
      });
    } else {

      this.selectedQuestion.subQuestion[k].options.push({
        option: '',
      });
    }
  }

  removeOption(i: number, j: number) {
    this.surveyForm.question[i].options.splice(j, 1)
  }
  removeSubOption(k: number, j: number) {
    debugger;
    this.surveyForm.question[this.selectedIndex].subQuestion[k].options.splice(j, 1)
  }

  addNewFieldQuestion(data) {
    this.selectedKey = data.key;
    this.addQuestion = false;
    let check = new SingleSelect(this.fb)
    if (this.selectedKey == 'selectOne') {
      this.surveyForm.question.push(check.singleSelect)
    } else if (this.selectedKey == 'text') {
      this.surveyForm.question.push(check.text)
    } else if (this.selectedKey == 'selectMany') {
      this.surveyForm.question.push(check.multipleSelect)
    } else if (this.selectedKey == 'number') {
      this.surveyForm.question.push(check.number)
    } else if (data.key == 'location') {
      this.surveyForm.question.push(check.location)
    } else if (data.key == 'photo') {
      this.surveyForm.question.push(check.photo)
    } else if (data.key == 'rating') {
      this.surveyForm.question.push(check.rating)
    } else if (data.key == 'datetime') {
      this.surveyForm.question.push(check.datetime)
    }


  }
  clearShowQuesObj() {
    this.showQuesObj = {
      questionTitle: '',
      operation: 'pleaseselect',
      answer: 'null'
    }
  }
  clearSkipLogicObj() {
    this.skipLogic = {
      questionTitle: 'pleaseselect',
      operation: 'pleaseselect',
      answer: 'pleaseselect',
      questionIndex: null
    }
  }

  addSubQuestion(data) {
    this.addSubQuestionBool = false
    console.log(this.showQuesObj)
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      let data = { ...check.singleSelect }

      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)


    } else if (data.key == 'selectMany') {

      let data = { ...check.multipleSelect }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? [this.showQuesObj.answer] : []
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'text') {

      let data = { ...check.text }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'number') {

      let data = { ...check.number }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'location') {

      let data = { ...check.location }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'photo') {

      let data = { ...check.photo }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'rating') {

      let data = { ...check.rating }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'datetime') {

      let data = { ...check.datetime }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.surveyForm.question[this.selectedIndex].subQuestion.push(data)

    }
    this.clearShowQuesObj()
  }


  addDuplicate(data, i) {
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      this.surveyForm.question.splice(i + 1, 0, check.singleSelect)
    } else if (data.key == 'selectMany') {
      this.surveyForm.question.splice(i + 1, 0, check.multipleSelect)
    } else if (data.key == 'text') {
      this.surveyForm.question.splice(i + 1, 0, check.text)
    } else if (data.key == 'number') {
      this.surveyForm.question.splice(i + 1, 0, check.number)
    } else if (data.key == 'location') {
      this.surveyForm.question.splice(i + 1, 0, check.location)
    } else if (data.key == 'photo') {
      this.surveyForm.question.splice(i + 1, 0, check.photo)
    } else if (data.key == 'rating') {
      this.surveyForm.question.splice(i + 1, 0, check.rating)
    } else if (data.key == 'datetime') {
      this.surveyForm.question.splice(i + 1, 0, check.datetime)
    }
  }

  addSubQuesDuplicate(data) {
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.singleSelect)
    } else if (data.key == 'selectMany') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.multipleSelect)
    } else if (data.key == 'text') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.text)
    } else if (data.key == 'number') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.number)
    } else if (data.key == 'location') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.location)
    } else if (data.key == 'photo') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.photo)
    } else if (data.key == 'rating') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.rating)
    } else if (data.key == 'datetime') {
      this.surveyForm.question[this.selectedIndex].subQuestion.push(check.datetime)
    }
  }

  saveSurvey() {
    console.log("123123123");
    console.log(Image);
    console.log(this.surveyForm.question);
    if (this.selectedLocations.length > 0) {
      if (this.surveyForm.projectName != "") {
        if (this.surveyForm.points > 0) {
          if (!this.isDateInvalid) {
            this.surveyForm.expirationDate = this.surveyForm.expirationDate;

            this.appService.updateSurvey(this._id, this.surveyForm).subscribe(res => {
              if (res.status == 1) {
                this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");

                this.toastr.success(res.message, 'Success', {

                  positionClass: 'toast-bottom-right'
                })
              } else {
                this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
                this.toastr.error('Error', res.message, {
                  positionClass: 'toast-bottom-right'
                })
              }
            })
          } else {
            this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
            this.toastr.error('Error', 'Invalid form details', {
              positionClass: 'toast-bottom-right'
            })
          }

        } else {
          this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
          this.toastr.error('Error', 'Points should be at least 1', {
            positionClass: 'toast-bottom-right'
          })
        }
      } else {
        this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
        this.toastr.error('Error', 'Project name cannot be empty', {
          positionClass: 'toast-bottom-right'
        })
      }
    } else {
      this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
      this.toastr.error('Error', 'Choose at least one location', {
        positionClass: 'toast-bottom-right'
      })
    }


  }

  saveLibrary() {
    if (this.surveyForm.question.length > 0) {
      this.surveyForm.expirationDate = this.surveyForm.expirationDate;
      this.appService.addLibrary(this.surveyForm).subscribe(res => {
        if (res.status == 1) {
          this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
          this.toastr.success('Survey added to library', 'Success', {
            positionClass: 'toast-bottom-right'
          })
        } else {
          this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
          this.toastr.error(res.message, 'Error', {
            positionClass: 'toast-bottom-right'
          })
        }
      })
    } else {
      this.surveyForm.expirationDate = this.surveyForm.expirationDate.replace("T00:00:00.000Z", "");
      this.toastr.error('The length of questions must be atleast one', 'Error', {
        positionClass: 'toast-bottom-right'
      })
    }
  }



  cancelSetting() {
    this.selectedQuestion.settings = this.surveyForm.question[this.selectedIndex].settings
  }


  getQuestionIndex(event) {
    this.questionIndex = event.target['selectedIndex'] - 1;
    if (this.skipLogicFilterQuesArray[this.questionIndex].key != 'selectOne' && this.skipLogicFilterQuesArray[this.questionIndex].key != 'selectMany') {
      this.finalOperations = this.operations.filter(e => e.operation == 'null' || e.operation == '!null').slice(0)
    } else {
      this.finalOperations = this.operations.slice(0)
    }
    this.skipLogic.questionIndex = this.questionIndex
  }

  getSkipLogicQuestions() {
    return this.skipLogicFilterQuesArray = this.surveyForm.question
  }

  pushInQuestion(event) {
    if (this.skipLogic.questionTitle == 'pleaseselect') {
      this.toastr.error('Please select question first', 'Error', {
        positionClass: 'toast-bottom-left'
      })
      return
    }
    if (this.skipLogic.operation == '=') {
      if (this.surveyForm.question[this.skipLogic.questionIndex].key == 'selectMany') {
        const ind = this.surveyForm.question[this.selectedIndex].settings.skipLogic.findIndex(e => e.questionTitle == this.skipLogic.questionTitle && e.answer == this.skipLogic.answer && e.operation == '=')
        if (ind != -1) {
          this.toastr.error('This condition already exists, please remove other condition', 'Error', {
            positionClass: 'toast-bottom-left'
          })
        } else {
          this.surveyForm.question[this.selectedIndex].settings.skipLogic.push(this.skipLogic)
          console.log(this.surveyForm.question[this.selectedIndex])
          this.skipLogic = {
            questionTitle: 'pleaseselect',
            operation: 'pleaseselect',
            answer: 'pleaseselect',
            questionIndex: null,
          }
        }
      } else {
        const ind = this.surveyForm.question[this.selectedIndex].settings.skipLogic.findIndex(e => e.questionTitle == this.skipLogic.questionTitle && e.answer != 'pleaseselect' || (e.operation == '=' || e.operation == 'null'))
        if (ind != -1) {
          this.toastr.error('As this question is not muti select, so you can only select one option', 'Error', {
            positionClass: 'toast-bottom-left'
          })
        } else {
          this.surveyForm.question[this.selectedIndex].settings.skipLogic.push(this.skipLogic)
          console.log(this.surveyForm.question[this.selectedIndex])
          this.skipLogic = {
            questionTitle: 'pleaseselect',
            operation: 'pleaseselect',
            answer: 'pleaseselect',
            questionIndex: null,
          }
        }
      }
    } else if (this.skipLogic.operation == '!=') {
      const ind = this.surveyForm.question[this.selectedIndex].settings.skipLogic.findIndex(e => e.questionTitle == this.skipLogic.questionTitle && e.answer != this.skipLogic.answer && e.operation == '!=')
      console.log(this.skipLogic)
      if (ind != -1) {
        this.toastr.error('This condition already exists, please remove other condition', 'Error', {
          positionClass: 'toast-bottom-left'
        })
      } else {
        this.surveyForm.question[this.selectedIndex].settings.skipLogic.push(this.skipLogic)
        console.log(this.surveyForm.question[this.selectedIndex])
        this.skipLogic = {
          questionTitle: 'pleaseselect',
          operation: 'pleaseselect',
          answer: 'pleaseselect',
          questionIndex: null,
        }
      }
    } else if (this.skipLogic.operation == 'null') {
      const ind = this.surveyForm.question[this.selectedIndex].settings.skipLogic.findIndex(e => e.questionTitle == this.skipLogic.questionTitle && (e.operation == 'null' || e.operation == '!null' || e.operation == '='))
      console.log(this.skipLogic)
      if (ind != -1) {
        this.toastr.error('Condition Conflict', 'Error', {
          positionClass: 'toast-bottom-left'
        })
      } else {
        this.surveyForm.question[this.selectedIndex].settings.skipLogic.push(this.skipLogic)
        console.log(this.surveyForm.question[this.selectedIndex])
        this.skipLogic = {
          questionTitle: 'pleaseselect',
          operation: 'pleaseselect',
          answer: 'pleaseselect',
          questionIndex: null,
        }
      }
    } else if (this.skipLogic.operation == '!null') {
      const ind = this.surveyForm.question[this.selectedIndex].settings.skipLogic.findIndex(e => e.questionTitle == this.skipLogic.questionTitle && (e.operation == '!null' || e.operation == 'null'))
      console.log(this.skipLogic)
      if (ind != -1) {
        this.toastr.error('Condition Conflict', 'Error', {
          positionClass: 'toast-bottom-left'
        })
      } else {
        this.surveyForm.question[this.selectedIndex].settings.skipLogic.push(this.skipLogic)
        console.log(this.surveyForm.question[this.selectedIndex])
        this.skipLogic = {
          questionTitle: 'pleaseselect',
          operation: 'pleaseselect',
          answer: 'pleaseselect',
          questionIndex: null,
        }
      }
    }
  }

  skipLogicCondition(question, i) {
    if (question.settings.skipLogic.length > 0) {
      for (let i = 0; i < question.settings.skipLogic.length; i++) {
        let showQues = true;
        // debugger
        const el = question.settings.skipLogic[i];
        // main array mein say index dhoodna question ka
        let quesFind = this.surveyForm.question.find(e => e.title == el.questionTitle)
        //  ab ye dekha k skip logic wali array ka operation kia 
        if (el.operation == '=') {
          if (quesFind) {
            if (quesFind.key == 'selectMany') {
              let ansFind = quesFind.answer.findIndex(e => e == el.answer)
              if (ansFind == -1) {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }

              }
            } else {
              if (quesFind.answer != el.answer) {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }
              }
            }
          }
        } else if (el.operation == '!=') {
          if (quesFind) {

            if (quesFind.key == 'selectMany') {
              let ansFind = quesFind.answer.findIndex(e => e == el.answer)

              if (ansFind != -1) {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }

              }
            } else {
              if (quesFind.answer == el.answer) {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }
              }
            }
          }
        }
        else if (el.operation == 'null') {
          if (quesFind) {
            if (quesFind.key == 'selectMany') {

              if (quesFind.answer.length != 0) {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }

              }
            } else {
              if (quesFind.answer != '') {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }
              }
            }
          }
        } else if (el.operation == '!null') {
          if (quesFind) {
            if (quesFind.key == 'selectMany') {

              if (quesFind.answer.length == 0) {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }

              }
            } else {
              if (quesFind.answer == '') {
                return !showQues
              } else {
                if (i == question.settings.skipLogic.length - 1) {
                  return showQues
                }
              }
            }
          }
        }
      }

      //   } else {
      //     if (quesFind.answer == '') {
      //       return false
      //     }
      //   }
      // } else if (el.operation == '!null') {
      // }
      // }
    } else {
      return true
    }

  }
  deleteSkipLogic(j) {
    this.selectedQuestion.settings.skipLogic.splice(j, 1)
  }

  changeAnswerArryInSkipLogic(event) {


    if (this.skipLogic.operation == '=' || this.skipLogic.operation == '!=') {
      this.skipLogicAnswerArray = this.skipLogicFilterQuesArray[this.questionIndex].options

    } else {
      this.skipLogicAnswerArray = []
      this.pushInQuestion(null)
    }


  }

  getShowCondition(question, subquestion) {
    console.log(subquestion.operation)

    if (subquestion.operation == '=') {

      question['finalSubQuestion'] = []

      return question.answer == subquestion.selectedAnswer
    } else if (subquestion.operation == '!=') {
      return question.answer != subquestion.selectedAnswer

    } else if (subquestion.operation == 'null') {

      return question.answer == ''
    } else if (subquestion.operation == '!null') {
      return question.answer != ''


    }
  }
  selectOption(event, question) {
    question.finalSubQuestions = []
    for (let i = 0; i < question.subQuestion.length; i++) {
      const element = question.subQuestion[i];
      // if (element.key != 'selectMany') {
      if (element.operation == '=') {
        if (element.selectedAnswer == question.answer) {
          question.finalSubQuestions.push(element)
        }
      } else if (element.operation == '!=') {
        if (element.selectedAnswer != question.answer) {
          question.finalSubQuestions.push(element)
        }
      } else if (element.operation == 'null') {
        if (question.answer == null || question.answer == '' || question.answer == '') {
          question.finalSubQuestions.push(element)
        }
      } else if (element.operation == '!null') {
        if (question.answer != null && question.answer != '') {
          question.finalSubQuestions.push(element)
        }
      }
    }
    console.log(question)

  }
  // multiple select work
  selectOptionMulti(event, question, option) {
    if (event.target.checked) {
      question.answer.push(option.option)
      this.ifChecked(question, option)
    } else {
      this.ifNotChecked(question, option)
    }
  }

  ifChecked(question, option) {
    for (let i = 0; i < question.subQuestion.length; i++) {
      const element = question.subQuestion[i];
      if (element.key != 'selectMany') {
        this.ifCheckedAndNotSelectMany(element, question, option, i)
        // main else
      } else {
        this.ifCheckedAndSelectMany(element, question, option, i)
      }
    }
    console.log(question)
  }


  ifCheckedAndNotSelectMany(element, question, option, i) {
    if (element.operation == '=') {
      if (element.selectedAnswer == option.option) {
        question.finalSubQuestions.push(element)
      }
    } else if (element.operation == '!=') {
      if (element.selectedAnswer != option.option) {
        let oldQues = question.finalSubQuestions.find(e => e.title == element.title)
        console.log(oldQues, 'oldQues', i)
        if (oldQues == null) {
          question.finalSubQuestions.push(element)
        }
      }
    } else if (element.operation == 'null') {
      if (element.selectedAnswer == '' || element.selectedAnswer == 'null') {
        let ind = this.surveyForm.question.findIndex(e => e.title == element.title)
        if (ind != -1) {
          this.surveyForm.question.splice(ind, 1);
        }
      }
    } else if (element.operation == '!null') {

      if (element.selectedAnswer != '' || element.selectedAnswer != 'null') {
        question.finalSubQuestions.push(element)
      }
    }
  }

  ifCheckedAndSelectMany(element, question, option, i) {

    if (element.operation == '=') {
      for (let j = 0; j < element.selectedAnswer.length; j++) {
        const element2 = element.selectedAnswer[j];
        if (element2 == option.option) {
          question.finalSubQuestions.push(element)
        }
      }
    } else if (element.operation == '!=') {
      for (let j = 0; j < element.selectedAnswer.length; j++) {
        const element2 = element.selectedAnswer[j];
        if (element2 != option.option) {
          let oldQues = question.finalSubQuestions.find(e => e.title == element.title)
          if (oldQues == null) {
            question.finalSubQuestions.push(element)
          }
        }
      }
    } else if (element.operation == 'null') {
      if (element.selectedAnswer == '' || element.selectedAnswer == 'null') {
        let ind = this.surveyForm.question.findIndex(e => e.title == question.title)
        if (ind != -1) {
          this.surveyForm.question.splice(ind + 1, 0, element);
          this.surveyForm.question.join()
        }
      }
    } else if (element.operation == '!null') {
      for (let j = 0; j < element.selectedAnswer.length; j++) {
        const element2 = element.selectedAnswer[j];
        if (element2 != '' || element2 != null) {
          question.finalSubQuestions.push(element)
        }
      }
    }
  }
  ifNotChecked(question, option) {
    question.subQuestion.map(e => {
      if (e.key != 'selectMany') {
        this.ifNotCheckedAndNotSelectMany(question, option, e)
      } else {
        this.ifNotCheckedAndSelectMany(question, option, e)
      }
    })

    console.log(question)
    let ind = question.answer.findIndex(e => e == option.option)
    if (ind != -1) {
      question.answer.splice(ind, 1)
    }
  }

  ifNotCheckedAndNotSelectMany(question, option, element) {
    if (element.operation == '=') {
      if (element.selectedAnswer == option.option) {
        let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
        if (ind != -1) {

          question.finalSubQuestions.splice(ind, 1)
        }
      }
    } else if (element.operation == '!=') {
      if (element.selectedAnswer != option.option) {
        let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
        if (ind != -1) {

          question.finalSubQuestions.splice(ind, 1)
        }
      }
    } else if (element.operation == 'null') {
      if (element.selectedAnswer == '' || element.selectedAnswer == 'null') {
        let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
        if (ind != -1) {

          question.finalSubQuestions.splice(ind, 1)
        }
      }
    } else if (element.operation == '!null') {

      let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
      if (ind != -1) {

        question.finalSubQuestions.splice(ind, 1)
      }
    }
  }

  ifNotCheckedAndSelectMany(question, option, element) {
    // for (let i = 0; i < element.selectedAnswer.length; i++) {
    //   const e2 = element.selectedAnswer[i];

    if (element.operation == '=') {
      for (let j = 0; j < element.selectedAnswer.length; j++) {
        const element2 = element.selectedAnswer[j];
        if (element2 == option.option) {
          let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
          if (ind != -1) {
            question.finalSubQuestions.splice(ind, 1)
          }
        }
      }
    } else if (element.operation == '!=') {
      for (let j = 0; j < element.selectedAnswer.length; j++) {
        const element2 = element.selectedAnswer[j];
        if (element2 != option.option) {
          let oldQues = question.finalSubQuestions.find(e => e.title == element.title)
          if (oldQues == null) {
            let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
            if (ind != -1) {
              question.finalSubQuestions.splice(ind, 1)
            }
          }
        }
      }
    } else if (element.operation == 'null') {
      if (element.selectedAnswer == '' || element.selectedAnswer == 'null') {
        let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
        if (ind != -1) {
          question.finalSubQuestions.splice(ind, 1)
        }
      }
    } else if (element.operation == '!null') {
      for (let j = 0; j < element.selectedAnswer.length; j++) {
        const element2 = element.selectedAnswer[j];
        if (element2 != '' || element2 != null) {
          let ind = question.finalSubQuestions.findIndex(e => e.title == element.title)
          if (ind != -1) {
            question.finalSubQuestions.splice(ind, 1)
          }
        }
      }
    }
  }





}
