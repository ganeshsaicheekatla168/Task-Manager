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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
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
      ToastModule,
      AutoCompleteModule
      ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
  providers:[MessageService]
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

  today: Date = new Date();
  
 
  
    
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
  
    constructor(private taskService:TaskService ,private fb: FormBuilder,private messageService:MessageService ,private userService:UserService){
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

    search(event:any){
      console.log(event);
      console.log(this.users);
    }
  

    confirmCreateTask(){
      console.log(this.formData.value);
      
      this.taskService.onTaskCreate(this.formData.value).subscribe({
       next: (responseData)=>{
         console.log(responseData.success);
          //clear form data
          this.clearData();
          this.showMessage();
       },
       error:(error)=>{

        if(error.status === 401){
          this.showSessionExpired();
        }else{
          console.log("creation error");
          console.log(error.error.error);
          this.showError(error.error.error.substring(31));
        }
       },
       
     });
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
          this.showSessionExpired();
        }
        else{
        this.showError("Error fetching users:"+error);
        }
      },
    })
  }

  showMessage() {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Task Created Successfully', 
      life: 2000 
    });
  }

   // Method to trigger a failure (error) toast message
  showError(message:string) {
    this.messageService.add({ 
      severity: 'error',  // Changed to 'error' for failure messages
      summary: 'Failed', 
      detail: `${message}, Please try again.`, 
      life: 4000  // Message will disappear after 4 seconds
    });
  }

  showSessionExpired(){
    this.messageService.add({ 
      severity: 'warn',  // Changed to 'error' for failure messages
      summary: 'Session Expired.', 
      detail: `Please Login Again`, 
      life: 4000  // Message will disappear after 4 seconds
    });
    setTimeout(() => {
      this.userService.clearUserData();
    }, 4000);
  }

  
   
  

}
