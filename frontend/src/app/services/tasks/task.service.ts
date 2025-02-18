import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';
 
  constructor(private http:HttpClient) { 
   
  }
 
 
   // Example method to register the user
    onTaskCreate(task: any):Observable<{ success: boolean; data: any; error: string }>{
      // Retrieve the JWT token from localStorage or wherever you have it stored
     const token = localStorage.getItem('token');

     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return  this.http.post<{ success: boolean; data: any; error: string }>(`${this.apiUrl}/add`, task,{headers});
    }

    onFetchTask():Observable<{ success: boolean; data: []; error: string }>{
      // Retrieve the JWT token from localStorage or wherever you have it stored
     const token = localStorage.getItem('token');

     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
     console.log(token);
      return  this.http.get<{ success: boolean; data: []; error: string }>(`${this.apiUrl}/all`,{headers});
      
    }

    onTaskUpdate(taskId:string , updatedTask : any){
      // Retrieve the JWT token from localStorage or wherever you have it stored
     const token = localStorage.getItem('token');

     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
     console.log(token);
      return  this.http.put<{ success: boolean; data: []; error: string }>(`${this.apiUrl}/update/${taskId}`,updatedTask,{headers});
    }

      // Service function to fetch tasks with pagination and filters
    onFetchCurrentPageTasks(page: number, limit: number, priority: string = '', status: string = '',title: string = ''): Observable<any> {
       // Retrieve the JWT token from localStorage or wherever you have it stored
     const token = localStorage.getItem('token');

     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const url = `${this.apiUrl}/paginatedTasks?page=${page}&limit=${limit}&priority=${priority}&status=${status}&title=${title}`;
      return this.http.get<any>(url,{headers});
    }
}
