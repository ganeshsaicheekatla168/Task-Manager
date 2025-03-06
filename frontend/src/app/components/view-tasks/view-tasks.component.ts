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
import { UserService } from '../../services/users/user.service';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag'; // Import TagModule
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-view-tasks',
  imports: [TableModule, InputTextModule, InputIconModule, IconFieldModule, PaginatorModule,
    FormsModule, CommonModule,
    ButtonModule,
    DropdownModule,        // PrimeNG input text
    SelectModule,           // PrimeNG dropdown
    RadioButtonModule,      // PrimeNG radio buttons
    CheckboxModule,            // PrimeNG button
    DatePickerModule,
    ReactiveFormsModule,
    DropdownModule,
    DialogModule,
    ToastModule, MessageModule,
    MultiSelectModule,
    MultiSelect,
    TagModule
  ],
  templateUrl: './view-tasks.component.html',
  styleUrl: './view-tasks.component.scss',
  providers: [MessageService]
})
export class ViewTasksComponent {
 
 
  currentTasks = [{
    "_id": "",
    "title": "fgfdfg",
    "description": "",
    "assignedToUsers": [],
    "dueDate": "",
    "priority": "",
    "status": "",
    "isRead": false,
    "isDelete": false
  }];
 
  // Initialize formData with default values for both create and edit
  formDefaults = {
    _id: '',
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: '',
    status: 'pending',
    isRead: false
  };
 
 
 
  //pagination variables
  totalRecords: number = 0;
  titleFilter: string = '';
  loading: boolean = false;
  first: number = 0;
  rows: number = 10;
  formData: FormGroup;
 
  //edit mode variables
  editMode: boolean = false;
  //delete mode variables
  deleteMode: boolean = false;
  deleteTaskId: string = '';
  deletedTaskTitle: string = '';
  // A list of users for the dropdown
 
  //today update date
  dueDate = new Date();
  debounceTimeout: any;
  searchUser!: string;
 
 
  isLoadingUsers: boolean = false;
  allUsersLoaded: boolean = false;
  lastLazyLoadTime: number = 0;
  assignedToUsers!: { firstName: string, userId: string }[];
  userIdsSet!: Set<string>;
 
 
  users: { first_name: string, _id: string }[] = [];
  assignedToUserFilter: string = '';
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
  selectedPriority: string = '';
  // Status options for the dropdown
  statusOptions = [
    { label: 'In-progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Filter By Status', value: '' }  // Option to clear the filter
  ];
  selectedStatus: string = '';
 
 
  constructor(private taskService: TaskService, private fb: FormBuilder, private messageService: MessageService, private userService: UserService, private router: Router) {
    // Initialize formData with FormBuilder
    this.formData = this.fb.group({
      _id: [''],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      assignedToUserId: [[], Validators.required],
      description: ['', [Validators.maxLength(100)]],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['pending'],  // Default to 'pending'
      isRead: [false]
    });
  }
 
  async ngOnInit() {
    this.loadUserList('0', 10, this.searchUser);
    this.userIdsSet = new Set<string>();
  }
  //Display tasks
  loadTasks(event: any): void {
    if(this.totalRecords === event.last){
      return
    }
    this.first = event.first;
    this.rows = event.rows;
    console.log(this.first);
    event.first = (event.first / event.rows) + 1;
    // console.log(event.rows);
    console.log(this.assignedToUserFilter)
 
    this.taskService.onFetchCurrentPageTasks(event.first, event.rows, this.selectedPriority, this.selectedStatus, this.titleFilter, this.assignedToUserFilter)
      .subscribe({
        next: (response) => {
          console.log("response is : " , response)
 
          if (response?.success) {
 
            this.currentTasks = response?.data?.tasks;
            this.totalRecords = response?.data?.totalCount;
            this.currentTasks.forEach((task) => {
              const utcDate = task.dueDate;
              // Convert UTC string to a Date object
              const date = new Date(utcDate);
              // Format the date to MM/DD/YYYY
              const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
              // Update the dueDate with the formatted date
              task.dueDate = formattedDate;
            })
            console.log(this.currentTasks);
 
          } else {
            console.error('Error fetching tasks:', response.error);
            this.showError('Error fetching tasks' + response.error.error.error);
          }
 
        },
        error: (error) => {
          console.error('API call failed:', error);
          this.showError(error);
        }
      });
  }
 
  //edit tasks
  async editCurrentTask(task: any, userName: string) {
    console.log(task);
    let userIds: any[] = [];
    this.assignedToUsers = task.assignedToUsers;
    for (let userObj of task.assignedToUsers) {
      userIds.push(userObj.userId);
    }
    console.log(userIds);
    this.dueDate = new Date(task.dueDate);
    setTimeout(() => {
      this.editMode = true;
      console.log("in edit method", task);
      if (this.formData) {
        // Set form values directly using patchValue
 
        this.formData.patchValue({
          _id: task._id,
          title: task.title,
          description: task.description,
          assignedToUserId: userIds,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          isRead: task.isRead
        });
        userIds = [];
 
      }
      else {
        console.log("Editing Task" + this.formData);
      }
    }, 100);
  }
  confirmEditCurrentTask() {
    this.assignedToUsers = [];
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
          this.loadTasks({ first: this.first, rows: this.rows });
 
          // Close edit mode
          this.clearEditFormData();
          this.showMessage("Task updated successfully");
        },
        error: (err) => {
          if (err.status === 401) {
            this.showSessionExpired();
          }
          else {
 
            this.loadTasks({ first: this.first, rows: this.rows });
            console.log('Error:', err.error.error);
            // Close edit mode
            this.clearEditFormData();
            this.showError('Error:' + err.error.error);
          }
 
        },
 
      });
    } else {
      this.showError("Form Data invalid. Please Fill all Reqiured Fields");
      console.log('Form is invalid. Please fix the errors.');
    }
  }
 
  //used in form control
  clearEditFormData() {
    this.assignedToUsers = [];
    this.editMode = false;
    this.formData.reset();
  }
 
  //delete tasks
  setCurrentDeleteTaskId(taskId: string, taskTitle: string) {
    this.deleteMode = true;
    this.deleteTaskId = taskId;
    this.deletedTaskTitle = taskTitle;
    console.log(this.deleteTaskId);
  }
  
  confirmCurrentTaskToDelete() {
    console.log(this.deleteTaskId);
    this.taskService.onTaskDelete(this.deleteTaskId)
      .subscribe({
        next: (response) => {
          console.log("delete data successfully");
          console.log(response.data);
          this.loadTasks({ first: this.first, rows: this.rows });
          this.deleteMode = false;
          this.showMessage("Task deletion successfully");
        },
        error: (err) => {
          if (err.status === 401) {
            this.showSessionExpired();
          } else {
 
            this.loadTasks({ first: this.first, rows: this.rows });
            this.deleteMode = false;
            console.log(err.error.error);
            this.showError(err.error.error);
          }
        },
 
      })
 
  }
  changeCurrentTaskModeToDelete() {
    this.deleteMode = false;
    this.deleteTaskId = '';
  }
 
 
  //for dropdown virtual scroll
  async loadUserList(first: string, limit: number, searchUser: string) {
    this.lastLazyLoadTime = Date.now();
    this.userService.getAllUsersNamesAndIdsBySearch(first, limit, searchUser).subscribe({
      next: (response) => {
 
        this.users = [...this.users, ...response.data];
        response.data.forEach(user => this.userIdsSet.add(user._id));
 
        if (response.data.length < limit) {
          this.allUsersLoaded = true;
        }
 
        console.log(this.users)
      },
      error: (error) => {
        if (error.status === 401) {
          this.showSessionExpired();
        }
        else {
          console.error('Error fetching users:', error);
          this.showError('Error fetching users:' + error);
        }
      }
    })
  }
  // Combine users and missing assigned users
  get combinedUsers(): any[] {
    // console.log(this.userIdsSet);
    // Filter out assigned IDs that are not in userIdsSet and map to selectedUsers
    const missingAssignedUsers = this.assignedToUsers?.filter(user =>
      !this.userIdsSet.has(user.userId)
    );
 
    if (missingAssignedUsers)
      return [...missingAssignedUsers.map(user => ({ "_id": user.userId, "first_name": user.firstName })), ...this.users];
    else
      return this.users;
  }
 
  async onUserSearch(event: any) {
    this.lastLazyLoadTime = Date.now();
    this.searchUser = event.filter;
    if (this.searchUser.length > 2) {
      this.isLoadingUsers = true;
      // Clear the previous timeout if it exists
 
      clearTimeout(this.debounceTimeout);
      // Set a new timeout to delay the function call
      this.debounceTimeout = setTimeout(async () => {
        this.users = []
        this.allUsersLoaded = false;
        await this.loadUserList('0', 10, this.searchUser);
 
        if (this.users.length === 0) {
          this.users = [{ first_name: 'No users found', _id: '' }];
        }
      }, 300); // Adjust 300ms to your desired delay
    }
    else if (this.searchUser.length === 0) {
      this.isLoadingUsers = true;
      this.allUsersLoaded = false;
      await this.loadUserList('0', 10, this.searchUser);
    }
    this.isLoadingUsers = false;
  }
  async onScrollEnd(event: any) {
 
    const now = Date.now();
    if (now - this.lastLazyLoadTime < 500 || this.allUsersLoaded || this.isLoadingUsers || event.first === 0) {
      return;
    }
    this.lastLazyLoadTime = now;
    const newStart = this.users.length;
    await this.loadUserList(newStart.toString(), 10, this.searchUser);
  }
  // Method to trigger a success toast message
  showMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 2000
    });
  }
 
  // Method to trigger a failure (error) toast message
  showError(message: string) {
    this.messageService.add({
      severity: 'error',  // Changed to 'error' for failure messages
      summary: 'Failed',
      detail: `${message}, Please try again.`,
      life: 4000  // Message will disappear after 4 seconds
    });
  }
 
  showSessionExpired() {
 
    this.messageService.add({
      severity: 'warn',  // Changed to 'error' for failure messages
      summary: 'Session Expired.',
      detail: `Please Login Again`,
      life: 4000  // Message will disappear after 4 seconds
    });
    setTimeout(() => {
      this.userService.clearUserData();
      this.router.navigate(['taskManager/login']);
    }, 4000);
  }
  //filters
  getPrioritySeverity(prirority: string): 'success' | 'warn' | 'danger' {
 
    switch (prirority) {
      case 'low': return 'success'
      case 'medium': return 'warn'
      default: return 'danger'
    }
  }
 
  onFilterChangeTitle(): void {
    if (this.titleFilter.length > 2 || this.titleFilter.length === 0) {
      // Clear the previous timeout if it exists
      clearTimeout(this.debounceTimeout);
 
      // Set a new timeout to delay the function call
      this.debounceTimeout = setTimeout(() => {
        this.loadTasks({ first: 0, rows: this.rows });
      }, 300); // Adjust 300ms to your desired delay
    }
  }
 
  onFilterChangeUser(): void {
    if (this.assignedToUserFilter.length > 2 || this.assignedToUserFilter.length == 0) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.loadTasks({ first: 0, rows: this.rows });
      }, 300)
    }
  }
 
  onFilterChange() {
    this.loadTasks({ first: 0, rows: this.rows });
  }
}