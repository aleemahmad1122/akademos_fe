import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { RewardsService } from 'app/service/rewards.service';
import { SurveyService } from 'app/service/survey.service';
import swal from 'sweetalert';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'app/service/api.service';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  searchText = '';
  base64Images: string[] = [];
  fullName: any = null;
  paymentMethod: any = null;
  phone: any = null;
  points: any = null;


  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any): void {
    this.base64Images = [];
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.base64Images.push(e.target.result);
      };
      reader.readAsDataURL(file);
      // Clear the file input value to allow re-selection of the same image
      this.fileInput.nativeElement.value = '';
    }
  }

  removeImage(index: number): void {
    this.base64Images.splice(index, 1);
  }




  loader = false;
  reward = {
    rewardPoints: 0
  };
  editrewarddata = {
    _id: '',
    name: '',
    desc: '',
    images: [],
    rewardPoints: 0,
    status: '1'
  };
  error;
  fieldTextType: boolean;
  rewardlist = [];
  noReward = false;
  rolelist = [];

  re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  emailVarifier = false;
  urllink: any;
  imgUpload: any;


  constructor(
    public service: RewardsService,
    private appService: ApiService,
    private surveyService: SurveyService,
    private toastr: ToastrService

  ) {
    this.getAllReward();
  }

  ngOnInit() {

  }

  close_add() {
    this.reward.name = '',
      this.reward.desc = '',
      this.reward.images = [],
      this.reward.rewardPoints = 0,
      this.reward.status = '1'
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }


  close() {
    this.reward.name = '';
    this.reward.desc = '';
    this.reward.rewardPoints = 0;
    this.reward.images = [];
    this.reward.status = '1';
  }
  submitreward() {
    this.reward.images = this.base64Images;
    // console.log(this.reward)
    // if (this.emailVarifier) {
    if (this.reward.name.trim() !== '' && this.reward.desc.trim() !== '' && this.reward.rewardPoints !== 0 && this.reward.images.length !== 0
    ) {
      this.service.addReward(this.reward).subscribe(data => {
        if (data.status == 1) {
          this.close()
          this.toastr.success('Reward added successfully', 'Success !', {
            positionClass: 'toast-bottom-right'
          });
          this.getAllReward();
        }
        else {
          this.toastr.error(data.message, 'Error', {
            positionClass: 'toast-bottom-right'
          });
        }


      })


    }
    else {
      this.toastr.error('Please fill all the fields', 'Form Invalid', {
        positionClass: 'toast-bottom-right'
      });

    }

  }

  getAllReward() {
    this.loader = true
    this.surveyService.rewardsList().subscribe(data => {
      this.loader = false
      if (data.status == 1) {

        this.rewardlist = data.data
        console.log(this.rewardlist);
      }
    })
  }

  //add k modal mein image add krwany k liye click say//
  fucntioncall() {
    document.getElementById("check").click();
  }
  //add k modal mein image remove krwany k liye click say//
  // removeImage(i) {
  //   this.reward.images.splice(i, 1);
  // }
  //update k modal mein image add krwany k liye click say//
  fucntioncall2() {
    document.getElementById("check2").click();
  }
  //update k modal mein image remove krwany k liye click say//
  removeImageUpdate(i) {
    this.editrewarddata.images.splice(i, 1);
  }


  getImage(event, key) {
    if (event && event.target.files.length > 0) {
      console.log("if1");
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.urllink = event.target.result;
      };
      let ext;
      ext = event.target.files[0].name.split(".");
      ext = ext[ext.length - 1];
      this.imgUpload = event.target.files[0];
      if (key == 'add') {
        console.log("add");
        this.appService.uploadImage(this.imgUpload).subscribe((res) => {
          console.log("before if");
          if (res["status"] == 1) {

            this.reward.images.push(res["imageName"]);
            console.log(res);
          } else {
            console.log("Error");
          }
        });

      } else {
        this.appService.uploadImage(this.imgUpload).subscribe((res) => {
          if (res["status"] == 1) {
            this.editrewarddata.images.push(res["imageName"]);
            console.log(res);
          } else {
            console.log("Error");
          }
        });
      }
    }
  }

  deletereward(id) {
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


          this.service.updateReward(id, { status: '-1' }).subscribe(data => {
            if (data.status == 1) {
              this.toastr.success('Reward Deleted Successfully', 'Success !', {
                positionClass: 'toast-bottom-right'
              });
              this.getAllReward();

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

  editreward(data) {

    this.fullName = data.fullName
    this.paymentMethod = data.paymentMethod
    this.phone = data.phone
    this.points = data.points

    this.editrewarddata._id = data._id
    this.editrewarddata.name = data.name
    this.editrewarddata.desc = data.desc
    this.editrewarddata.images = data.images;
    this.editrewarddata.rewardPoints = data.points;
    this.editrewarddata.status = data.status;

  }


  rewardPointsInvalid(): boolean {
    const points = this.editrewarddata.rewardPoints;
    return points === null || points <= 0 || points > this.points;
  }
  updatereward() {
    console.log(this.editrewarddata.rewardPoints)

    this.surveyService.updateReward(this.editrewarddata._id, { points: this.editrewarddata.rewardPoints }).subscribe(_ => {
      if (_.status == 1) {
        this.close()
        this.toastr.success('Reward is updated', 'Success !', {
          positionClass: 'toast-bottom-right'
        });
        this.getAllReward();
      }
      else {
        this.toastr.error('', 'Something went wrong', {
          positionClass: 'toast-bottom-right'
        });
      }
    })
  }
}
