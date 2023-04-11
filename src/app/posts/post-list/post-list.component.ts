import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PostService } from '../post-service/post.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isAuthenticated = false;
  private postSub!: Subscription;
  private authSub!: Subscription;
  public userId!: string | null;

  totalPost = 0;
  postsPerPage = 2;
  postsOptions = [1, 2, 5, 10];
  currentPage = 1;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postSub = this.postService
      .updatePostListener()
      .subscribe((postsData: { posts: Post[]; postCount: number }) => {
        this.totalPost = postsData.postCount;
        this.posts = postsData.posts;
      });
    this.isAuthenticated = this.authService.getAuth();
    this.authSub = this.authService
      .listenAuthStatus()
      .subscribe((isAuthenticate) => {
        this.isAuthenticated = isAuthenticate;
        this.userId = this.authService.getUserId();
      });
  }

  deletePost(id: string): void {
    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onPageChange(pageDetails: PageEvent) {
    this.currentPage = pageDetails.pageIndex + 1;
    this.postsPerPage = pageDetails.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
