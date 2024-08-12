import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'app/service/admin.service';
import { countries } from 'app/shared/countries';
import { sectors } from 'app/shared/sectors';
import { SurveyService } from 'app/service/survey.service';
import { SingleSelect } from 'app/shared/typesOfQuestions';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-user-single-response',
  templateUrl: './user-single-response.component.html',
  styleUrls: ['./user-single-response.component.scss']
})
export class UsersingleresponseComponent implements OnInit {

  imgUpload = "";
  imageSource = null;
  searchText = '';
  loader = false
  addQuestion = false;
  surveyList = [];
  title = new FormControl('');
  selectedKey = ''
  lat = 31.0;
  long = 35.0;
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

  showQuesObj = {
    questionTitle: '',
    operation: 'pleaseselect',
    answer: 'null'
  }
  addSubQuestionn: boolean = false;

  surveyForm = {
    projectName: '',
    desc: '',
    expirationDate: '',
    sector: null,
    country: null,
    points: 0,
    status: 1,
    filter: {
      from: 0,
      to: 0,
      selectedGender: 'All',
      exactAge: 0,
      location: [],
    },
    question: [],
  }
  selectedQuestion: any;
  selectedSub1Index: any;
  selectedSub1Question: any;
  isEdit: string = '';
  answer: boolean;
  surveyId: any;

  constructor(
    private toastr: ToastrService,
    private appService: SurveyService,
    private route: ActivatedRoute,
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
    console.log(this.surveyForm)
  }

  getServeyById() {
    let questions = new SingleSelect(this.fb)
    this.loader = true
    this._id = this.route.snapshot.params._id
    this.surveyId = this.route.snapshot.params.surveyId
    this.appService.getResponseById(this._id,this.surveyId).subscribe(data => {
      this.loader = false
      if (data.status == 1) {
        this.surveyForm = data.data.survey
        console.log(this.surveyForm)
      }
    })
  }

  exportDataToExcel(): void {
    console.log(this.surveyForm);
    var jsonData = [
      { Project_Name: this.surveyForm.projectName, Description:this.surveyForm.desc, Country: this.surveyForm.country, Deadline: this.surveyForm.expirationDate, Points: this.surveyForm.points, Sector: this.surveyForm.sector, Gender: this.surveyForm.filter.selectedGender, "From(Age)":this.surveyForm.filter.from, "To(Age)":this.surveyForm.filter.to, "Exact(Age)":this.surveyForm.filter.exactAge},
      // { name: 'Jane', age: 25, city: 'Los Angeles' },
      // { name: 'Doe', age: 40, city: 'Chicago' }
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

    // Example: Inserting a title at A1
    // XLSX.utils.sheet_add_aoa(worksheet, [['Sample Data']], {origin: 'A1'});
  
    // Example: Inserting a header row at A3
    // XLSX.utils.sheet_add_aoa(worksheet, [['Name', 'Age', 'City']], {origin: 'A3'});
    var colPos = 5;
    XLSX.utils.sheet_add_aoa(worksheet, [['LOCATIONS']], {origin: 'A'+(colPos)});
    colPos++;
    XLSX.utils.sheet_add_aoa(worksheet, [['latitude', 'longitude', 'radius']], {origin: 'B'+(colPos)});
    colPos++;

    for (let item of this.surveyForm.filter.location) {
      
      XLSX.utils.sheet_add_aoa(worksheet, [[item.latitude]], {origin: 'B'+(colPos)});
      XLSX.utils.sheet_add_aoa(worksheet, [[item.longitude]], {origin: 'C'+(colPos)});
      XLSX.utils.sheet_add_aoa(worksheet, [[item.radius]], {origin: 'D'+(colPos)});
      colPos++;
    }

    colPos++;
    XLSX.utils.sheet_add_aoa(worksheet, [['QUESTIONS']], {origin: 'A'+(colPos)});
    colPos++;

    // for(var i=0;i<=this.surveyForm.question.length;i++){
    //   console.log("called");
    //   console.log(this.surveyForm.question.find(item => item. === ));
    //   XLSX.utils.sheet_add_aoa(worksheet, [[this.surveyForm.question[i]]], {origin: 'A'+(5+1)});
    // }
    
    var qNo = 1;
    for (let item of this.surveyForm.question) {
      console.log(item.title);
      XLSX.utils.sheet_add_aoa(worksheet, [["Q: "+qNo]], {origin: 'A'+(colPos)});
      XLSX.utils.sheet_add_aoa(worksheet, [[item.title]], {origin: 'B'+(colPos)});
      colPos++;
      if(item.key == "selectOne"){
        var i=1;
        for (let item_ of item.options) {
          XLSX.utils.sheet_add_aoa(worksheet, [["op: "+i++]], {origin: 'B'+(colPos)});
          XLSX.utils.sheet_add_aoa(worksheet, [[item_.option]], {origin: 'C'+(colPos)});
          if(item.answer==item_.option){
            XLSX.utils.sheet_add_aoa(worksheet, [["Selected"]], {origin: 'D'+(colPos)});
          }
          colPos++;
        }
        
      }else if(item.key == "selectMany"){
        var i=1;
        for (let item_ of item.options) {
          XLSX.utils.sheet_add_aoa(worksheet, [["op: "+i++]], {origin: 'B'+(colPos)});
          XLSX.utils.sheet_add_aoa(worksheet, [[item_.option]], {origin: 'C'+(colPos)});
          if(item_.checked){
            XLSX.utils.sheet_add_aoa(worksheet, [["Selected"]], {origin: 'D'+(colPos)});
          }
          colPos++;
        }
        
      }else if(item.key == "photo"){
        XLSX.utils.sheet_add_aoa(worksheet, [["ANSWER"]], {origin: 'B'+(colPos)});
        XLSX.utils.sheet_add_aoa(worksheet, [[item.img]], {origin: 'C'+(colPos)});
        colPos++;
      }else if(item.key == "location"){
        XLSX.utils.sheet_add_aoa(worksheet, [["ANSWER"]], {origin: 'B'+(colPos)});
        XLSX.utils.sheet_add_aoa(worksheet, [["lat:"+item.answer[0]+" , long:"+item.answer[1]]], {origin: 'C'+(colPos)});
        colPos++;
      } else{
        XLSX.utils.sheet_add_aoa(worksheet, [["ANSWER"]], {origin: 'B'+(colPos)});
        XLSX.utils.sheet_add_aoa(worksheet, [[item.answer]], {origin: 'C'+(colPos)});
        colPos++;
      }
      qNo++;
      colPos++;
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

  addSkipLogicQuestion() {
    this.selectedQuestion.settings.skipLogic.push({
      questionTitle: 'null',
      operation: '!null',
      answer: 'null'
    })
  }

  setOptions(index, j) {
    let i = index - 1
    this.selectedQuestion.settings.skipLogic[j]['innerOptionArray'] = this.surveyForm.question[i].options
  }

  deleteSkipLogic(j) {
    this.selectedQuestion.settings.skipLogic.splice(j, 1)
  }


  openSetting(i) {
    this.selectedIndex = i;
    this.selectedQuestion = this.surveyForm.question[this.selectedIndex]
  }
  removeQuestion(i) {
    this.surveyForm.question.splice(i, 1)
  }

  openSub1Setting(k) {
    this.selectedSub1Index = k;
    this.selectedSub1Question = this.surveyForm.question[this.selectedIndex].subQuestion[this.selectedSub1Index]
  }

  removeSub1Question(k) {
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
  removeSub1Option(k: number, j: number) {
    debugger;
    this.surveyForm.question[this.selectedIndex].subQuestion[k].options.splice(j, 1)
  }

  addNewFieldQuestion(data) {
    this.selectedKey = data.key
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
    }
    else if (data.key == 'location') {
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
  addSubQuestion(data) {
    this.addSubQuestionn = false
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


  addDuplicate(data) {
    let check = new SingleSelect(this.fb)
    if (data.key == 'selectOne') {
      this.surveyForm.question.push(check.singleSelect)
    } else if (data.key == 'selectMany') {
      this.surveyForm.question.push(check.multipleSelect)
    } else if (data.key == 'text') {
      this.surveyForm.question.push(check.text)
    } else if (data.key == 'number') {
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
    console.log(this.surveyForm)
    this.appService.updateSurvey(this._id, this.surveyForm).subscribe(res => {
      if (res.status == 1) {
        this.toastr.success('Survey updated', 'Success', {
          positionClass: 'toast-bottom-right'
        })
      } else {
        this.toastr.error('Error', res.message, {
          positionClass: 'toast-bottom-right'
        })
      }
    })
  }

  saveLibrary() {

    if (this.surveyForm.question.length > 0) {

      this.appService.addLibrary(this.surveyForm).subscribe(res => {
        if (res.status == 1) {
          this.toastr.success('Survey added to library', 'Success', {
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
    this.selectedQuestion.settings = this.surveyForm.question[this.selectedIndex].settings
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
      if (element.operation == '=') {
        if (element.selectedAnswer == question.answer) {
          question.finalSubQuestions.push(element)
        }

      } else if (element.operation == '!=') {
        if (element.selectedAnswer != question.answer) {
          question.finalSubQuestions.push(element)

        }
      } else if (element.operation == 'null') {

        if (question.answer == null || question.answer == '') {
          question.finalSubQuestions.push(element)

        }
      } else if (element.operation == '!null') {
        if (question.answer != null && question.answer != '') {
          question.finalSubQuestions.push(element)

        }


      }

    }


  }
  selectOptionMulti(event, question, option) {

    if (event.target.checked) {

      question.answer.push(option)
      for (let i = 0; i < question.subQuestion.length; i++) {
        const element = question.subQuestion[i];
        console.log(typeof element.selectedAnswer)

        // main if
        if (typeof element.selectedAnswer == 'string') {

          if (element.operation == '=') {

            if (element.selectedAnswer == option.option) {
              question.finalSubQuestions.push(element)


            }

          } else if (element.operation == '!=') {
            if (element.selectedAnswer != option.option) {
              let oldQues = question.finalSubQuestions.find(e => e.title == element.title)

              if (oldQues == null) {
                question.finalSubQuestions.push(element)
              }
            }


          } else if (element.operation == 'null') {

            if (element.selectedAnswer == '' || element.selectedAnswer == null) {
              question.finalSubQuestions.push(element)


            }
          } else if (element.operation == '!null') {

            if (element.selectedAnswer != '' || element.selectedAnswer != null) {
              question.finalSubQuestions.push(element)
            }
          }
                  // main else
        } else {

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
            for (let j = 0; j < element.selectedAnswer.length; j++) {
              const element2 = element.selectedAnswer[j];


              if (element2 == '' || element2 == null) {
                question.finalSubQuestions.push(element)


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

      }
    } else {

     question.subQuestion.map(e=>{
      if (e.key != 'selectMany') {


        question.answer = question.answer.filter(e => e.option != option.option)

        question.finalSubQuestions = question.finalSubQuestions.filter(e => e.selectedAnswer != option.option)



        
      }else{
        for (let i = 0; i < e.selectedAnswer.length; i++) {
          const e2 = e.selectedAnswer[i];
          
          if (e.operation == '==') {
  
  
            if (e2 == option.option) {
              question.finalSubQuestions.splice(e)
  
  
            }
            
          }else if(e.operation == '!='){
            if (e2 == option.option) {
              console.log(e2,'hanji mil gya ')
  
  
            }


          }
        }

      }
     })


      
    }

      console.log(question, 'final===============================>')

    }
  }
