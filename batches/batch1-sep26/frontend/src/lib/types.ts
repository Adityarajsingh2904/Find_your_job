export interface Community {
    id: string
    name: string
    description: string
    members: number
    moderator: string
    createdAt: string
    posts: Post[]
  }
  
  export interface Post {
    id: string
    title: string
    content: string
    author: string
    timeAgo: string
    likes: number
    dislikes: number
    image?: string
    comments: Comment[]
  }
  
  export interface Comment {
    id: string
    author: string
    content: string
    timeAgo: string
    likes: number
    dislikes: number
    replies?: Reply[]
  }
  
  export interface Reply {
    id: string
    author: string
    content: string
    timeAgo: string
    likes: number
    dislikes: number
  }
  
  