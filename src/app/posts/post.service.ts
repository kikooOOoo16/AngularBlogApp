import {Post} from './post.model';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostService {
  private posts: Post[] = [];
  private postsUpdate = new Subject<{posts: Post[], numOfPosts: number}>();

  constructor(private http: HttpClient, private router: Router) {
  }


  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{message: string, posts: any, numOfPosts: number}>(
        'http://localhost:3000/posts' + queryParams
      )
      .pipe(map(responseData => {
        return {
          posts: responseData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imageUrl: post.imageUrl
            };
          }),
          numOfPosts: responseData.numOfPosts
        };
      }))
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdate.next({posts: [...this.posts], numOfPosts: transformedPostData.numOfPosts});
      });
  }

  getPostUpdateListener(): Observable<{posts: Post[], numOfPosts: number}> {
    return this.postsUpdate.asObservable();
  }

  getPost(id: string): Observable<any> {
    return this.http.get<{_id: string, title: string, content: string, imageUrl: string}>('http://localhost:3000/posts/' + id);
  }

  addPost(post: Post, image: File): void {
    const postData = new FormData(); // enables us to combine text with blobs
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', image, post.title);
    this.http
      .post<{message: string, post: Post}>('http://localhost:3000/posts', postData)
      .subscribe(responseData => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, post: Post, postImage: string | File): void {
    let postData: Post | FormData;
    if (typeof postImage === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', postImage, post.title);
    } else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: postImage
      };
    }
    this.http.put('http://localhost:3000/posts/' + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete('http://localhost:3000/posts/' + id);
  }
}
