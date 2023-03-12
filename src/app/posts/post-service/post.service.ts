import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { Post } from '../post.model';
import { GetPosts } from './post-service.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private updatedPosts = new Subject<{ posts: Post[]; postCount: number }>();
  private URL_DOMAIN = `http://localhost:3000/`;

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<GetPosts>(this.URL_DOMAIN + `api/posts` + queryParams)
      .pipe(
        map((response) => {
          return {
            posts: response.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creatorId: post.creator
              };
            }),
            maxPosts: response.maxPosts,
          };
        })
      )
      .subscribe((response) => {
        console.log(response);
        this.posts = response.posts;
        this.updatedPosts.next({
          posts: [...this.posts],
          postCount: response.maxPosts,
        });
      });
  }

  updatePostListener() {
    return this.updatedPosts.asObservable();
  }

  addPost(title: string, content: string, image: File): void {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image, title);

    this.http
      .post<{ message: string; post: Post }>(
        this.URL_DOMAIN + `api/posts`,
        formData
      )
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(this.URL_DOMAIN + `api/deletePost/` + id);
  }

  updatePost(post: Post, image: File | string): void {
    let postData: any;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('title', post.title!);
      postData.append('content', post.content!);
      postData.append('image', image, post.title);
    } else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: post.imagePath,
      };
    }
    this.http
      .put(this.URL_DOMAIN + `api/updatePost/` + post.id, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  getPostById(id: string | null) {
    return this.http.get(this.URL_DOMAIN + `api/post/` + id);
  }
}
