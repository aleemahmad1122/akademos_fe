import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms"

export class SingleSelect {
    constructor(private fb: FormBuilder) { }

    singleSelect = {
        name: 'Select One',
        key: 'selectOne',
        options: [],
        image:'',
        title: '',
        answer: '',
        finalSubQuestions: [],
        subQuestion: [],
        hint: '',
        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    };
    multipleSelect = {
        name: 'Select Many',
        key: 'selectMany',
        options: [],
        image:'',
        title: '',
        answer: [],
        finalSubQuestions: [],
        subQuestion: [],
        hint: '',
        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    };
    text = {

        name: 'Text',
        key: 'text',
        image:'',
        title: '',
        answer: '',
        hint: '',
        subQuestion: [],

        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    }
    number = {

        name: 'Number',
        key: 'number',
        image:'',
        title: '',
        answer: '',
        hint: '',
        subQuestion: [],

        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    }
    location = {

        name: 'Location',
        key: 'location',
        image:'',
        title: '',
        lat: '',
        long: '',
        hint: '',
        subQuestion: [],
        finalSubQuestions: [],
        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    }
    photo = {
        name: 'Photo',
        key: 'photo',
        image:'',
        title: '',
        img: '',
        hint: '',
        subQuestion: [],

        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    }
    rating = {

        name: 'Rating',
        key: 'rating',
        image:'',
        options: [],
        title: '',
        answer: '',
        subQuestion: [],
        finalSubQuestions: [],
        hint: '',
        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    };
    datetime = {

        name: 'Date & time',
        key: 'datetime',
        image:'',
        title: '',
        answer: '',
        subQuestion: [],
        finalSubQuestions: [],
        hint: '',
        settings: {
            errorMessage: '',
            isImp: 'false', default: '', skipLogic: []
        }
    }
}
