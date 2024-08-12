import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'app/service/admin.service';
import { countries } from 'app/shared/countries';
import { sectors } from 'app/shared/sectors';
import { SingleSelect } from 'app/shared/typesOfQuestions';
import { SurveyService } from 'app/service/survey.service';


@Component({
  selector: 'app-librarydetail',
  templateUrl: './librarydetail.component.html',
  styleUrls: ['./librarydetail.component.scss']
})
export class LibrarydetailComponent implements OnInit {

  imgUpload = "";
  imageSource = null;
  searchText = '';
  loader = false
  addQuestion = false;
  libraryList = [];
  title = new FormControl('');
  selectedKey = ''
  lat = 31.0;
  long = 35.0;
  sectors: { name: string; }[];
  countries: { name: string; }[];
  _id:string;
  selectedIndex;
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
  singleQuestion: FormGroup;
  selectedQuestionData: any;
  selectedQuestionFormGroup: FormGroup;
  selectedSkipQuestionIndex: number;
  selectionQuestionOptionAray: FormArray;

  showQuesObj = {
    questionTitle: '',
    operation: 'pleaseselect',
    answer: 'null'
  }
  addSubQuestionn: boolean = false;

  libraryForm = {
    projectName: '',
    desc: '',
    sector: null,
    country: null,
    points: 0,
    status: 1,
    filter: {
      selectedGender: 'All',
      from: 0,
      to: 0,
      exactAge: 0,
    },
    question: [],
  }
  selectedQuestion: any;
  selectedSub1Index: any;
  selectedSub1Question: any;

  constructor(
    private toastr: ToastrService,
    private appService: SurveyService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder


  ) {

  }

  ngOnInit() {
    this.getData();

  }
  getData() {
    this.sectors = sectors
    this.countries = countries
    this.getServeyById()
  }


  check() {
    console.log(this.libraryForm)
  }

  getServeyById() {
    let questions = new SingleSelect(this.fb)
    this.loader = true
    this._id = this.route.snapshot.params._id
    this.appService.getLibraryById(this._id).subscribe(data => {

      this.loader = false
      if (data.status == 1) {
        this.libraryForm = data.data
      }
    })
  }

  addSkipLogicQuestion() {
    this.selectedQuestion.settings.skipLogic.push({
      questionTitle: 'null',
      operation: '!null',
      answer: 'null'
    })
  }

  setOptions(index, j) {
    let i = index - 1

    console.log(i)
    this.selectedQuestion.settings.skipLogic[j]['innerOptionArray'] = this.libraryForm.question[i].options
  }

  deleteSkipLogic(j) {
    this.selectedQuestion.settings.skipLogic.splice(j, 1)
  }


  openSetting(i) {
    this.selectedIndex = i;
    this.selectedQuestion = this.libraryForm.question[this.selectedIndex]
  }
  removeQuestion(i) {
    this.libraryForm.question.splice(i, 1)
  }

  openSub1Setting(k) {
    this.selectedSub1Index = k;
    this.selectedSub1Question = this.libraryForm.question[this.selectedIndex].subQuestion[this.selectedSub1Index]
  }

  removeSub1Question(k) {
    this.libraryForm.question[this.selectedIndex].subQuestion.splice(k, 1)
  }

  addNewFieldOption(i, k) {
    this.libraryForm.question[i].options.push({
      option: '',
    });
  }
  addNewSubQuesFieldOption(k) {
    this.selectedQuestion.subQuestion[k].options.push({
      option: '',
    });
  }

  removeOption(i: number, j: number) {
    this.libraryForm.question[i].options.splice(j, 1)
  }
  removeSub1Option(k: number, j: number) {
    debugger;
    this.libraryForm.question[this.selectedIndex].subQuestion[k].options.splice(j, 1)
  }

  addNewFieldQuestion(data) {
    this.selectedKey = data.key
    this.addQuestion = false;
    let check = new SingleSelect(this.fb)
    if (this.selectedKey == 'selectOne') {
      this.libraryForm.question.push(check.singleSelect)
    } else if (this.selectedKey == 'text') {
      this.libraryForm.question.push(check.text)
    } else if (this.selectedKey == 'selectMany') {
      this.libraryForm.question.push(check.multipleSelect)
    } else if (this.selectedKey == 'number') {
      this.libraryForm.question.push(check.number)
    }
    else if (data.key == 'location') {
      this.libraryForm.question.push(check.location)
    } else if (data.key == 'photo') {
      this.libraryForm.question.push(check.photo)
    } else if (data.key == 'rating') {
      this.libraryForm.question.push(check.rating)
    } else if (data.key == 'datetime') {
      this.libraryForm.question.push(check.datetime)
    }


  }
  clearShowQuesObj() {
    this.showQuesObj = {
      questionTitle: '',
      operation: 'pleaseselect',
      answer: 'null'
    }
  }
  addSubQuestion(data) {
    this.addSubQuestionn = false
    console.log(this.showQuesObj)
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      let data = { ...check.singleSelect }

      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)


    } else if (data.key == 'selectMany') {

      let data = { ...check.multipleSelect }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? [this.showQuesObj.answer] : []
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'text') {

      let data = { ...check.text }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'number') {

      let data = { ...check.number }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'location') {

      let data = { ...check.location }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'photo') {

      let data = { ...check.photo }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'rating') {

      let data = { ...check.rating }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    } else if (data.key == 'datetime') {

      let data = { ...check.datetime }
      data['operation'] = this.showQuesObj.operation ? this.showQuesObj.operation : null
      data['selectedAnswer'] = this.showQuesObj ? this.showQuesObj.answer : null
      this.libraryForm.question[this.selectedIndex].subQuestion.push(data)

    }
    this.clearShowQuesObj()
  }

  addDuplicate(data) {
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      this.libraryForm.question.push(check.singleSelect)
    } else if (data.key == 'selectMany') {
      this.libraryForm.question.push(check.multipleSelect)
    } else if (data.key == 'text') {
      this.libraryForm.question.push(check.text)
    } else if (data.key == 'number') {
      this.libraryForm.question.push(check.number)
    } else if (data.key == 'location') {
      this.libraryForm.question.push(check.location)
    } else if (data.key == 'photo') {
      this.libraryForm.question.push(check.photo)
    } else if (data.key == 'rating') {
      this.libraryForm.question.push(check.rating)
    } else if (data.key == 'datetime') {
      this.libraryForm.question.push(check.datetime)
    }
  }

  addSubQuesDuplicate(data) {
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.singleSelect)
    } else if (data.key == 'selectMany') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.multipleSelect)
    } else if (data.key == 'text') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.text)
    } else if (data.key == 'number') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.number)
    } else if (data.key == 'location') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.location)
    } else if (data.key == 'photo') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.photo)
    } else if (data.key == 'rating') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.rating)
    } else if (data.key == 'datetime') {
      this.libraryForm.question[this.selectedIndex].subQuestion.push(check.datetime)
    }
  }

  saveLibrary() {
    console.log(this.libraryForm)
    this.appService.updateLibrary(this.libraryForm).subscribe(res => {
      if (res.status == 1) {
        this.toastr.success('Library updated', 'Success', {
          positionClass: 'toast-bottom-right'
        })
      } else {
        this.toastr.error('Error', res.message, {
          positionClass: 'toast-bottom-right'
        })
      }
    })

  }
  valuechange(event,key){
    if (key == 'from') {
          if (this.libraryForm.filter.from != 0) {
        // this.libraryForm.filter.from = 0;
        // this.libraryForm.filter.to = 0;
        this.libraryForm.filter.selectedGender =this.libraryForm.filter.selectedGender,
        this.libraryForm.filter.from =this.libraryForm.filter.from,
        this.libraryForm.filter.to =this.libraryForm.filter.to,
        this.libraryForm.filter.exactAge =0
          

        
      }
    }else if(key == 'to'){
    if (this.libraryForm.filter.exactAge != 0) {
        // this.libraryForm.filter.from = 0;
        // this.libraryForm.filter.to = 0;
        this.libraryForm.filter.selectedGender=this.libraryForm.filter.selectedGender,
          
        this.libraryForm.filter.from=this.libraryForm.filter.from,
        this.libraryForm.filter.to=this.libraryForm.filter.to,
        this.libraryForm.filter.exactAge=0        
      }
    }else{

      if (this.libraryForm.filter.exactAge != 0) {
        // this.libraryForm.filter.from = 0;
        // this.libraryForm.filter.to = 0;
        this.libraryForm.filter.selectedGender=this.libraryForm.filter.selectedGender,
        this.libraryForm.filter.from= 0,
        this.libraryForm.filter.to=0,
        this.libraryForm.filter.exactAge=this.libraryForm.filter.exactAge
          
        
      };
    }

  }


  saveSurvey() {
    delete this.libraryForm['_id']
    if (this.libraryForm.question.length > 0) {

      this.appService.addSurvey(this.libraryForm).subscribe(res => {
        if (res.status == 1) {

          this.router.navigate(['/library'])
          this.toastr.success('Survey created', 'Success', {
            positionClass: 'toast-bottom-right'
          })
        } else {
          this.toastr.error(res.message, 'Error', {
            positionClass: 'toast-bottom-right'
          })
        }
      })
    } else {
      this.toastr.error('The length of questions must be atleast one', 'Error', {
        positionClass: 'toast-bottom-right'
      })

    }
  }

  saveSetting() {
    document.getElementById('close').click()
  }

  cancelSetting() {
    this.selectedQuestion.settings = this.libraryForm.question[this.selectedIndex].settings
  }


}
