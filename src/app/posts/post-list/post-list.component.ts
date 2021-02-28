import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {PostService} from '../post.service';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  postsSub: Subscription;
  constructor(public postsService: PostService) { }

  ngOnInit(): void {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.isLoading = true;
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], numOfPosts: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.numOfPosts;
        this.posts = postData.posts;
      });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
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
