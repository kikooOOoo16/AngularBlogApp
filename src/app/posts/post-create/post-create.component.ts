import {Component, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {NgForm} from '@angular/forms';
import {PostService} from '../post.service';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  public editPostId = null;
  isLoading = false;
  private mode = 'create';
  public editPost: Post;

  constructor(public postsService: PostService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.editPostId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.editPostId).subscribe((postData => {
          this.isLoading = false;
          this.editPost = {id: postData._id, title: postData.title, content: postData.content};
          console.log(this.editPost);
        }));
      } else {
        this.mode = 'create';
        this.editPostId = null;
      }
    });
  }

  onSavePost(form: NgForm): void {
    if (form.invalid) { return; }
    this.isLoading = true; // we navigate away from this page so we don't have to reset it to false
    if (this.mode === 'create') {
      this.postsService.addPost({id: null, title: form.value.title, content: form.value.content});
    } else {
      this.postsService.updatePost(this.editPostId, {id: this.editPostId, title: form.value.title, content: form.value.content});
    }
    form.resetForm();
  }
}
