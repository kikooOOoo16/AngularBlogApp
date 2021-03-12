import {Post} from './post.model';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = `${environment.apiUrl}posts/`;

@Injectable({providedIn: 'root'})
export class PostService {
  private posts: Post[] = [];
  private postsUpdate = new Subject<{posts: Post[], numOfPosts: number}>();

  constructor(private http: HttpClient, private router: Router) {
  }

  getPostUpdateListener(): Observable<{posts: Post[], numOfPosts: number}> {
    return this.postsUpdate.asObservable();
  }

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{message: string, posts: any, numOfPosts: number}>(
        BACKEND_URL + queryParams
      )
      .pipe(map(responseData => {
        return {
          posts: responseData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imageUrl: post.imageUrl,
              author: post.author
            };
          }),
          numOfPosts: responseData.numOfPosts
        };
      }))
      .subscribe(transformedPostData => {
        console.log(transformedPostData);
        this.posts = transformedPostData.posts;
        this.postsUpdate.next({posts: [...this.posts], numOfPosts: transformedPostData.numOfPosts});
      });
  }

  getPost(id: string): Observable<any> {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imageUrl: string,
      author: string
    }>(BACKEND_URL + id);
  }

  addPost(post: Post, image: File): void {
    const postData = new FormData(); // enables us to combine text with blobs
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', image, post.title);
    console.log(postData);
    this.http
      .post<{message: string, post: Post}>(BACKEND_URL, postData)
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
        imageUrl: postImage,
        author: null
        // we will take care of this on the server so that it can't be edited here
      };
    }
    this.http.put(BACKEND_URL + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${BACKEND_URL}${id}`);
  }
}
