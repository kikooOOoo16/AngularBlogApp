import {Post} from './post.model';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostService {
  private posts: Post[] = [];
  private postsUpdate = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {
  }


  getPosts(): void {
    this.http
      .get<{message: string, posts: any}>(
        'http://localhost:3000/posts'
      )
      .pipe(map(responseData => {
        return responseData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          };
        });
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postsUpdate.next([...this.posts]);
      });
  }

  getPostUpdateListener(): Observable<Post[]> {
    return this.postsUpdate.asObservable();
  }

  getPost(id: string): Observable<any> {
    return this.http.get<{_id: string, title: string, content: string}>('http://localhost:3000/posts/' + id);
  }

  addPost(post: Post): void {
    this.http.post<{message: string, postId: string}>('http://localhost:3000/posts', post).subscribe(responseData => {
      post.id = responseData.postId;
      this.posts.push(post);
      this.postsUpdate.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  updatePost(id: string, post: Post): void {
    this.http.put('http://localhost:3000/posts/' + id, {title: post.title, content: post.content}).subscribe(response => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postsUpdate.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  deletePost(id: string): void {
    this.http.delete('http://localhost:3000/posts/' + id).subscribe(responseData => {
      this.posts = this.posts.filter(post => {
        return post.id !== id;
      });
      this.postsUpdate.next([...this.posts]);
    });
  }
}
