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
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
 
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
      ToastModule
    ],
  templateUrl: './view-tasks.component.html',
  styleUrl: './view-tasks.component.scss',
  providers:[MessageService]
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



    //today update date 
    today = new Date();
    debounceTimeout:any;
 
    constructor(private taskService:TaskService ,private fb: FormBuilder,private messageService:MessageService ,private userService:UserService,private router:Router ){
       // Initialize formData with FormBuilder
       this.formData = this.fb.group({
        _id:[''],
        title: ['', [Validators.required,Validators.minLength(5), Validators.maxLength(50)]],
        assignedToUserId: ['', Validators.required],
        description: ['', [Validators.maxLength(100)]],
        dueDate: ['', Validators.required],
        priority: ['', Validators.required],
        status: ['pending'],  // Default to 'pending'
        isRead: [false]
      });
    }
 
    async ngOnInit() {
      await this.loadUserList();
      this.loadTasks({first:0 ,limit : 10});
     
    }
 
   
    loadTasks(event: any): void{
      this.first  =event.first;
      this.rows = event.rows;
      console.log(this.first);
       event.first = (event.first/event.rows)+1;
      // console.log(event.rows);
      console.log("in frontend")
     
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
              this.showError('Error fetching tasks'+response.error.error.error);
            }
         
          },
          error : (error) => {
            console.error('API call failed:', error);
            this.showError( error);
          }
        });
    }
    async loadUserList(){
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
            console.error('Error fetching users:', error);
            this.showError('Error fetching users:'+ error);
          }
        }
      })
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
           this.deleteMode=false;
           console.log(removedTask);
           this.showMessage("Task deletion successfully");
         } ,
         error : (err) =>{
            if(err.status === 401){
              this.showSessionExpired();
            }else{
           
              this.loadTasks({first:this.first,rows:this.rows});
                this.deleteMode=false;
              console.log(err.error.error);
              this.showError(err.error.error);
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
      this.today = task.dueDate;
      console.log("in edit method")
      if(this.formData){
        // Set form values directly using patchValue
        this.formData.patchValue({
          _id:task._id,
          title: task.title,
          description: task.description,
          assignedToUserId: task.assignedToUserId,
          dueDate:task.dueDate,
          priority: task.priority,
          status: task.status,
          isRead: task.isRead
        });
      }
      else{
         console.log("Editing Task"+this.formData);
      }
    }
    confirmEditTask(){
      console.log("confirm edit")
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
               
                // Close edit mode
                this.clearData();
                this.showMessage("Task updated successfully");
              },
              error: (err) => {
                    if(err.status === 401){
                      this.showSessionExpired();
                    }
                    else{
                   
                      this.loadTasks({first:this.first,rows:this.rows});
                      console.log('Error:', err.error.error);
                      // Close edit mode
                      this.clearData();
                      this.showError('Error:'+ err.error.error);
                    }
                 
              },
             
            });
          } else {
            this.showError("Form Data invalid. Please Fill all Reqiured Fields");
            console.log('Form is invalid. Please fix the errors.');
          }
    }
 
    //used in form control
    clearData(){
      this.editMode = false;
        this.formData.reset();
    }
 
    onFilterChange(): void {
      if(this.titleFilter.length > 2 || this.titleFilter.length == 0){
        // Clear the previous timeout if it exists
          clearTimeout(this.debounceTimeout);
          // Set a new timeout to delay the function call
          this.debounceTimeout = setTimeout(() => {
            this.loadTasks({ first: this.first, rows: this.rows });
          }, 300); // Adjust 300ms to your desired delay
      }
    }
 
 
    showMessage(message:string) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: message,
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
        this.router.navigate(['/login']);
      }, 4000);
    }
 
}