import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TaskService } from '../../services/tasks/task.service';
import { AppService } from '../../services/apps/app.service';
import { UserService } from '../../services/users/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-create-task',
  imports: [FormsModule , CommonModule ,
      ButtonModule  ,
      DropdownModule,        // PrimeNG input text
      SelectModule,           // PrimeNG dropdown
      RadioButtonModule,      // PrimeNG radio buttons
      CheckboxModule,            // PrimeNG button
      DatePickerModule ,
      ReactiveFormsModule,
      InputTextModule,
      HeaderComponent
      ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss'
})
export class CreateTaskComponent {

   // Initialize formData with default values for both create and edit
   formDefaults = {
    _id:'',
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: '',
    status: 'pending',
    isRead: false
  };
   

    //toast message
    successMessage:boolean =  false;
    errorMessage:boolean = false;
    toastMessage:string= '';
 
  
    
    // A list of users for the dropdown
    users = [
      { name: 'User 1', id: '1' },
    ];
  
    // Priority options for the dropdown
    priorityOptions = [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' }
    ];
    priorityOptionsToFilter = [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Filter By Priority', value: '' }  // Option to clear the filter
    ];
    selectedPriority : string  = '';
     // Status options for the dropdown
     statusOptions = [
      { label: 'In-progress', value: 'in-progress' },
      { label: 'Completed', value: 'completed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Filter By Status', value: '' }  // Option to clear the filter
    ];
    selectedStatus : string  = '';
  
    //pagination variable
    formData: FormGroup ;
  
    constructor(private taskService:TaskService ,private fb: FormBuilder,private appServices:AppService ,private userService:UserService){
       // Initialize formData with FormBuilder
       this.formData = this.fb.group({
        _id:[''],
        title: ['', [Validators.required,Validators.minLength(5), Validators.maxLength(50)]],
        assignedTo: ['', Validators.required],
        description: ['', [Validators.maxLength(100)]],
        dueDate: ['', Validators.required],
        priority: ['', Validators.required],
        status: ['pending'],  // Default to 'pending'
        isRead: [false]
      });
    }

    ngOnInit(): void {
      // Load your Tasks here
    
      this.loadUserList();
    }
  

    confirmCreateTask(){
      console.log(this.formData.value);
      
      this.taskService.onTaskCreate(this.formData.value).subscribe({
       next: (responseData)=>{
         console.log(responseData.success);
              
               this.toastMessage='Task created successfully!';
               this.successMessage =true;
         
          //clear form data
          this.clearData();
          
          setTimeout(() => {
           this.clearToast();  // Reset  message after a timeout
         }, 4000);
       },
       error:(error)=>{

        if(error.status === 401){
          this.userService.clearUserData();
        }
         
         console.log("creation error");
         console.log(error.error.error);
 
         this.toastMessage = error.error.error.substring(31);
         this.errorMessage = true;
        
         setTimeout(() => {
           this.clearToast();  // Reset  message after a timeout
         }, 4000);
       
       },
       
     });
   }

   clearToast():void{
    this.errorMessage = false;
    this.successMessage =false;
    this.toastMessage = '';
  }

  //used in form control
  clearData(){
      this.formData.reset();
  }

  loadUserList():void{
    this.userService.getAllUsersNamesAndIds().subscribe({
      next : (responseData)=>{
        console.log(responseData);
        if(responseData.success){
          responseData.data.forEach((user) => {
            this.users.push({
              name:user.first_name,
              id: user._id
              }
            );
          });
          this.users.splice(0, 1);
        }
       
      },
      error: (error) => {
        if(error.status === 401){
          this.userService.clearUserData();
        }
        console.error('Error fetching users:', error);
        this.toastMessage = "Error fetching users:"+error;
        this.errorMessage = true;
        setTimeout(() => {
          this.clearToast();  // Reset error message after a timeout
        }, 4000);
      },
      complete : ()=>{
        setTimeout(() => {
          this.clearToast();  // Reset error message after a timeout
        }, 4000);
      }
    })
  }
   
  

}
