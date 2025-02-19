import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TaskService } from '../../services/tasks/task.service';
import { AppService } from '../../services/apps/app.service';
import { UserService } from '../../services/users/user.service';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-view-tasks',
  imports: [TableModule ,InputTextModule,InputIconModule,IconFieldModule ,PaginatorModule,
      FormsModule , CommonModule ,
      ButtonModule  ,
      DropdownModule,        // PrimeNG input text
      SelectModule,           // PrimeNG dropdown
      RadioButtonModule,      // PrimeNG radio buttons
      CheckboxModule,            // PrimeNG button
      DatePickerModule ,
      ReactiveFormsModule,
      DropdownModule,
      DialogModule,
      ToastModule,
      HeaderComponent
    ],
  templateUrl: './view-tasks.component.html',
  styleUrl: './view-tasks.component.scss'
})
export class ViewTasksComponent {

    currentTasks = [{
      "_id": "",
      "title": "fgfdfg",
      "description": "",
      "assignedTo": "",
      "dueDate": "",
      "priority": "",
      "status": "",
      "isRead": false,
      "isDelete":false
  }];
  
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
    
   //edit mode variables
    editMode :boolean=false;
  
    //delete mode variables
    deleteMode:boolean=false;
    deleteTaskId:string = '';
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
    deletedTaskTitle:string = '';
  
    //pagination variables
    totalRecords:number = 0;
    titleFilter:string = '';
    loading:boolean = false;
    first:number = 0;
    rows:number=10;
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
      this.loadUserList();
      this.loadTasks({first:0 ,limit : 10});
      
    }
  
   
    loadTasks(event: any): void{
      this.first  =event.first;
      this.rows = event.rows;
      console.log(this.first);
       event.first = (event.first/event.rows)+1;
      // console.log(event.rows);
     
      this.taskService.onFetchCurrentPageTasks(event.first, event.rows, this.selectedPriority, this.selectedStatus,this.titleFilter)
        .subscribe({
         next : (response) => {
            if (response?.success) {
  
              this.currentTasks = response?.data?.tasks;
              this.totalRecords = response?.data?.totalCount;
              this.currentTasks.forEach((task)=>{
                const utcDate = task.dueDate;
                // Convert UTC string to a Date object
                const date = new Date(utcDate);
                // Format the date to MM/DD/YYYY
                const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                // Update the dueDate with the formatted date
                 task.dueDate = formattedDate;
            })
  
            } else {
              console.error('Error fetching tasks:', response.error);
            }
         
          },
          error : (error) => {
            if(error.status === 401){
              this.userService.clearUserData();
            }
            console.error('API call failed:', error);
            
          }
        });
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
          else{
            console.error('Error fetching users:', error);
            this.toastMessage = "Error fetching users:"+error;
            this.errorMessage = true;
            setTimeout(() => {
              this.clearToast();  // Reset error message after a timeout
            }, 4000);
          }
        },
        complete : ()=>{
          setTimeout(() => {
            this.clearToast();  // Reset error message after a timeout
          }, 4000);
        }
      })
    }
  
    clearToast():void{
      this.errorMessage = false;
      this.successMessage =false;
      this.toastMessage = '';
    }
  
  
  
    setDeleteId(taskId:string,taskTitle:string) {
      this.deleteMode=true;
      this.deleteTaskId=taskId;
      this.deletedTaskTitle=taskTitle;
      console.log(this.deleteTaskId);
    }
    confirmDeleteTask(){
       // Find the task in the allFromDb array
       const taskIndex = this.currentTasks.findIndex(task => task._id === this.deleteTaskId);
       const removedTask = this.currentTasks.splice(taskIndex, 1)[0]; // Remove task by ID
       console.log(removedTask);
       removedTask.isDelete = true;
       this.taskService.onTaskUpdate(removedTask._id , removedTask)
       .subscribe({
         next : (response) => {
           console.log("delete data successfully");
           console.log(response.data);
           this.loadTasks({first:this.first,rows:this.rows});
           this.toastMessage = "Task deleted successfully"
           this.successMessage = true;
           this.deleteMode=false;
           console.log(removedTask);
           setTimeout(() => {
            this.clearToast();  // Reset  message after a timeout
           }, 4000);
         } ,
         error : (err) =>{
          if(err.status === 401){
            this.userService.clearUserData();
          }
          else{
            this.loadTasks({first:this.first,rows:this.rows});
            this.toastMessage = "Task Deletion unsuccessfully "
            this.errorMessage = true;
              this.deleteMode=false;
            console.log(err.error.error);
            setTimeout(() => {
              this.clearToast();  // Reset  message after a timeout
            }, 4000);
          }
         },
       
       })
       
    }
    changeDeleteMode(){
      this.deleteMode=false;
      this.deleteTaskId='';
    }
  
    editCurrentTask(task:any){
      this.editMode = true;
      if(this.formData){
        // Set form values directly using patchValue
        this.formData.patchValue({
          _id:task._id,
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate.split('T')[0], // Convert ISO string to local date format
          priority: task.priority,
          status: task.status,
          isRead: task.isRead
        });
      }
      console.log("Editing Task"+this.formData.value);
    }
    confirmEditTask(){
      console.log(this.formData.value);
            // Check if form is valid before submitting
          if (this.formData && this.formData.valid) {
            // Prepare the task data for update
            const updatedTask = { ...this.formData.value }; // Get the updated values from the form
  
            // Ensure no fields like `createdAt`, `updatedAt` or `__v` are submitted
            delete updatedTask._v;
            delete updatedTask.createdAt;
            delete updatedTask.updatedAt;
            // Send the updated task to the backend
            this.taskService.onTaskUpdate(this.formData.value._id, updatedTask).subscribe({
              next: (response) => {
                this.loadTasks({first:this.first,rows:this.rows});
                this.toastMessage = "Task updated successfully"
                this.successMessage = true;
                
                // Close edit mode
                this.clearData();
                setTimeout(() => {
                  this.clearToast();  // Reset  message after a timeout
                }, 4000);
              },
              error: (err) => {
                if(err.status === 401){
                  this.userService.clearUserData();
                }
                else{
                
                    this.loadTasks({first:this.first,rows:this.rows});
                    this.toastMessage = "Task updation unsuccessfully"
                    this.errorMessage = true;
                    console.log('Error:', err.error.error);
                    // Close edit mode
                    this.clearData();
                    setTimeout(() => {
                      this.clearToast();  // Reset  message after a timeout
                    }, 4000);
                  }
              },
              
            });
          } else {
            console.log('Form is invalid. Please fix the errors.');
          }
    }
  
   
    //used in form control
    clearData(){
      this.editMode = false;
        this.formData.reset();
    }
  
    onFilterChange(): void {
      this.loadTasks({first:0,rows:10});
    }

}
