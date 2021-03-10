import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {PostService} from '../post.service';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  userId: string;
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  isAuthenticated = false;
  private postsSub: Subscription;
  private authSub: Subscription;
  constructor(
    private postsService: PostService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], numOfPosts: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.numOfPosts;
        this.posts = postData.posts;
      });
    this.isAuthenticated = this.authService.getIsAuth();
    this.authSub = this.authService.getAuthStatusObservable()
      .subscribe(authenticatedStatus => {
        this.isAuthenticated = authenticatedStatus;
        this.userId = this.authService.getUserId();

      });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  onDelete(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangedPage($event: PageEvent): void {
    this.isLoading = true;
    this.currentPage = $event.pageIndex + 1;
    this.postsPerPage = $event.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}
