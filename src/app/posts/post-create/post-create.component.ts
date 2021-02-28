import {Component, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PostService} from '../post.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {mimeType} from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  postInputForm: FormGroup;
  isLoading = false;
  editPost: Post;
  imagePreview: string;
  private editPostId = null;
  private mode = 'create';

  constructor(public postsService: PostService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.postInputForm = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(4)]
      }),
      image: new FormControl(null, {
        validators: [Validators.required], asyncValidators: [mimeType]
      }),
      content: new FormControl(null, {
        validators: [Validators.required]
      })
    });
    this.router.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.editPostId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.editPostId).subscribe(postData => {
          this.isLoading = false;
          this.editPost = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imageUrl: postData.imageUrl
          };
          this.postInputForm.setValue({
            title: this.editPost.title,
            content: this.editPost.content,
            image: this.editPost.imageUrl
          });
        });
      } else {
        this.mode = 'create';
        this.editPostId = null;
      }
    });
  }

  onSavePost(): void {
    if (this.postInputForm.invalid) { return; }
    this.isLoading = true; // we navigate away from this page so we don't have to reset it to false
    if (this.mode === 'create') {
      this.postsService.addPost(
        {
          id: null, title: this.postInputForm.value.title,
          content: this.postInputForm.value.content,
          imageUrl: null
        },
        this.postInputForm.value.image
      );
    } else {
      this.postsService.updatePost(this.editPostId, {
        id: this.editPostId,
        title: this.postInputForm.value.title,
        content: this.postInputForm.value.content,
        imageUrl: null
      }, this.postInputForm.value.image );
    }
    this.postInputForm.reset();
  }

  onImagePick($event: Event): void {
    const file = ($event.target as HTMLInputElement).files[0]; // file is a file Object
    this.postInputForm.patchValue({image: file});
    this.postInputForm.get('image').updateValueAndValidity();
    // informs Angular that we changed the value and it should re evaluate the value and store it internally and check if valid
    // to preview the image we need to transform it to a data URL. We define the reader and instruct it what to do when it loads a file
    // and then we call it to load that file
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = (reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
