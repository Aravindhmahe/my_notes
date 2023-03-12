
export interface GetPosts {
  message: string;
  posts: PostsDto[];
  maxPosts: number

}

interface PostsDto {
  creator: any;
  _id: string;
  title: string;
  content: string;
  imagePath: string;
}
