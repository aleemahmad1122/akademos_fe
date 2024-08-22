import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RewardsService } from 'app/service/rewards.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {

  loader = false;
  searchText = '';
  rewards: any[] = [];
  rewardsForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private _rewards: RewardsService,
    private _toastr: ToastrService,
    private _fb: FormBuilder
  ) {
    this.setForm();
  }

  ngOnInit() {
    this.getAllReward();
  }

  setForm() {
    this.rewardsForm = this._fb.group({
      _id: [null],
      name: [null, Validators.required],
      description: [null, Validators.required],
      points: [null, Validators.required],
      image: [null],
      status: [null]
    });
  }

  getAllReward() {
    this.loader = true;
    this._rewards.rewardList().subscribe(
      response => {
        this.loader = false;
        if (response.status === 1) {
          this.rewards = response.data;
        }
      },
      error => {
        this.loader = false;
        console.error('Error fetching rewards', error);
        this._toastr.error('Error fetching rewards', 'Error', {
          positionClass: 'toast-bottom-right'
        });
      }
    );
  }

  editUser(data: any) {
    this.rewardsForm.patchValue({
      _id: data._id,
      name: data.name,
      description: data.desc,
      points: data.rewardPoints,
      status: data.status
    });

    // Handle image preview
    if (data.images && data.images.length > 0) {
      this.imagePreview = data.images[0];
      this.rewardsForm.patchValue({ image: data.images[0] });
    } else {
      this.imagePreview = null;
    }
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this reward?')) {
      this._rewards.deleteReward(id).subscribe(
        () => {
          this.getAllReward();
          this._toastr.success('Reward deleted successfully', 'Success!', {
            positionClass: 'toast-bottom-right'
          });
        },
        error => {
          console.error('Error deleting reward', error);
          this._toastr.error('Error deleting reward', 'Error', {
            positionClass: 'toast-bottom-right'
          });
        }
      );
    }
  }

  submitForm() {
    if (this.rewardsForm.valid) {
      const formValue = this.rewardsForm.value;
      const payload = {
        "name": formValue.name,
        "desc": formValue.description,
        "rewardPoints": formValue.points,
        "images": [formValue.image],
        "status": formValue.status
      };

      if (formValue._id) {
        // Update existing reward
        this._rewards.updateReward(formValue._id, payload).subscribe(
          (response: any) => {
            if (response.status === 0) {
              this._toastr.error('Error updating reward: ' + response.message, 'Error', {
                positionClass: 'toast-bottom-right'
              });
            } else {
              this.getAllReward();
              this._toastr.success('Reward updated successfully', 'Success!', {
                positionClass: 'toast-bottom-right'
              });
            }
          },
          error => {
            console.error('Error updating reward', error);
            this._toastr.error('Error updating reward', 'Error', {
              positionClass: 'toast-bottom-right'
            });
          }
        );
      } else {
        // Create new reward
        this._rewards.addReward(payload).subscribe(
          (response: any) => {
            if (response.status === 0) {
              this._toastr.error('Error adding reward: ' + response.message, 'Error', {
                positionClass: 'toast-bottom-right'
              });
            } else {
              this.getAllReward();
              this.resetForm();
              this._toastr.success('Reward added successfully', 'Success!', {
                positionClass: 'toast-bottom-right'
              });
            }
          },
          error => {
            console.error('Error adding reward', error);
            this._toastr.error('Error adding reward', 'Error', {
              positionClass: 'toast-bottom-right'
            });
          }
        );
      }
    } else {
      this._toastr.warning('Please fill in all required fields', 'Warning', {
        positionClass: 'toast-bottom-right'
      });
    }
  }

  resetForm() {
    this.rewardsForm.reset();
    this.setForm();
    this.imagePreview = null;
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; // Update image preview
        this.rewardsForm.patchValue({
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
