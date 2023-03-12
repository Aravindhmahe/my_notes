import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostService } from '../post-service/post.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  createPostForm!: FormGroup;
  private postId!: string | null;
  private post!: Post;
  imagePreview!: string;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initialiseFormControls();

    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has('postId')) {
        this.postId = params.get('postId');
        this.postService.getPostById(this.postId).subscribe((postData: any) => {
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
          };
          this.setFormValues();
        });
      } else {
        this.postId = null;
      }
    });
  }

  initialiseFormControls(): void {
    this.createPostForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      file: [''],
    });
  }

  fileUpload(event: Event) {
    const newFile: File = (event.target as HTMLInputElement).files![0];
    this.createPostForm.controls['file'].setValue(newFile);
    this.createPostForm.get('file')?.updateValueAndValidity();

    var reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(newFile);
  }

  onSavePost(): void {
    const formControls = this.createPostForm.controls;
    if (this.postId !== null) {
      const editedPost = {
        id: this.postId,
        title: formControls['title'].value,
        content: formControls['content'].value,
        imagePath: formControls['file'].value,
      };
      this.postService.updatePost(editedPost, formControls['file'].value);
    } else {
      this.postService.addPost(
        formControls['title'].value,
        formControls['content'].value,
        formControls['file'].value
      );
    }
    this.createPostForm.reset();
    this.createPostForm.updateValueAndValidity();
  }

  setFormValues(): void {
    const formControls = this.createPostForm.controls;
    formControls['title'].setValue(this.post.title);
    formControls['content'].setValue(this.post.content);
    formControls['file'].setValue(this.post.imagePath);
  }
}
