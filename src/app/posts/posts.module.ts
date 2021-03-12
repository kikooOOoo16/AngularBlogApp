import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PostListComponent} from './post-list/post-list.component';
import {PostCreateComponent} from './post-create/post-create.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularMaterialModule} from '../angular-material/angular-material.module';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    PostListComponent,
    PostCreateComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule
  ]
})
export class PostsModule { }
