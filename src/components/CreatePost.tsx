import React, { useState, type ChangeEvent } from "react"
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { fetchCommunities, type Community } from "./CommunityList";

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: number | null;
}

const createPost = async (post: PostInput, imageFile: File) => {

  const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`

  const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, imageFile)

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicURLData } = supabase.storage.from("post-images").getPublicUrl(filePath)

  const { data, error } = await supabase.from("posts").insert({ ...post, img_url: publicURLData.publicUrl });

  if (error) throw new Error(error.message)
  return data;
};


export const CreatePost = () => {

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user } = useAuth();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: { post: PostInput, imageFile: File }) => {
      return createPost(data.post, data.imageFile)
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedFile) return;
    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile
    })
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="title" className="block mb-2 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          onChange={(event) => setTitle(event.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block mb-2 font-medium">
          Content
        </label>
        <textarea
          id="content"
          rows={5}
          onChange={(event) => setContent(event.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="community" className="block mb-2 font-medium">Select Community</label>
        <select
          id="community"
          onChange={handleCommunityChange}
          className="w-full border border-white/10 bg-transparent text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        >
          <option value={""} className="bg-[#181b20] text-gray-400">
            -- Choose a Community --
          </option>
          {communities?.map((community) => (
            <option key={community.id} value={community.id} className="bg-[#181b20] text-white">
              {community.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">Upload Image</label>

        <div className="relative">
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden" // Default input ko hide kar diya
          />

          <label
            htmlFor="image"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-[#181b20] hover:bg-[#1e2229] hover:border-purple-500/50 transition-all duration-300"
          >
            {/* Upload Icon */}
            <svg
              className="w-8 h-8 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {/* File Status Text */}
            <p className="text-sm text-gray-400">
              {selectedFile ? (
                <span className="text-green-400 font-semibold">
                  {selectedFile.name}
                </span>
              ) : (
                <>
                  <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedFile ? "Click again to change" : "SVG, PNG, JPG or GIF"}
            </p>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>

      {isError && <p className="text-red-500"> Error creating post.</p>}
    </form>
  )
}   
