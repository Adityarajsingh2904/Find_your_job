import { useState, FormEvent, ChangeEvent, SetStateAction, Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, getIdTokenNoParam } from "@/utils";
import { toast } from "sonner";

interface Post {
    communityId: string;
    id: string;
    title: string;
    content: string;
    author: string;
    timeAgo: string;
    likes: number;
    dislikes: number;
    image: string | null;
    comments: Comment[];
    createdAt: any;
    updatedAt: any;
}

interface Comment {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
    likes: number;
    dislikes: number;
}

function CreatePost({ communityId, setPosts }: { communityId: string; setPosts: Dispatch<SetStateAction<Post[]>> }) {
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Updated Image Handling (matches your function style)
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file); // Set image state first
      setPreview(URL.createObjectURL(file)); // Generate preview from the same file
      setError(""); 
    }
  };

  // Handle new post submission
  const handlePostSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!newPost.title.trim() || !newPost.content.trim()) {
    toast.error("Title and content are required.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const user = await getCurrentUser();
    const author = user?.uid || "";
    const displayAuthor = user?.email || "anonymous@email.com";
    const idToken = await getIdTokenNoParam();

    const formData = new FormData();
    formData.append("communityId", communityId);
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    formData.append("author", author);
    formData.append("displayAuthor", displayAuthor);

    if (image) {
      formData.append("image", image);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/posts`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${idToken}` },
      body: formData,
    });

    if (!res.ok) toast.error("Failed to create post");

    let {post}= await res.json();

    setPosts((prevPosts) => [post, ...prevPosts]);

    // Reset form after submission
    setNewPost({ title: "", content: "" });
    setImage(null);
    setPreview(null);
    toast.success("Post added successfully")
  } catch (err) {
    toast.error("Error posting. Try again later.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold text-blue-600 mb-4">Create Post</h2>

      <form onSubmit={handlePostSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          className="border-blue-200"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <Textarea
          placeholder="What's on your mind?"
          className="min-h-[100px] border-blue-200"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        
        {/* Image Upload */}
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && <img src={preview} alt="Preview" className="w-full h-auto rounded mt-2" />}

        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
