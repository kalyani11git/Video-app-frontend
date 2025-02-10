import React, { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newVideo, setNewVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch videos
  useEffect(() => {
    fetch("https://video-app-backend-1.onrender.com/videos")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          setVideos(data);
        }
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  // Handle video delete
  const handleDelete = (videoId) => {
    fetch(`https://video-app-backend-1.onrender.com/video/${videoId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setVideos(videos.filter((video) => video._id !== videoId));
        } else {
          console.error("Failed to delete video");
        }
      })
      .catch((error) => console.error("Error deleting video:", error));
  };

  // Handle video update
  const handleUpdate = (videoId) => {
    // Open modal for video update
    const video = videos.find((v) => v._id === videoId);
    setTitle(video.filename); // Set existing title for the form
    setSelectedVideo(videoId);
    setIsModalOpen(true);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setNewVideo(e.target.files[0]);
  };

  // Handle form submission for video update
  const handleSubmitUpdate = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append title if it is changed
    if (title) {
      formData.append("title", title);
    }

    // Append new video file if it is provided
    if (newVideo) {
      formData.append("video", newVideo);
    }

    fetch(`https://video-app-backend-1.onrender.com/video/${selectedVideo}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // Refresh the video list after update
          setVideos(
            videos.map((video) =>
              video._id === selectedVideo
                ? {
                    ...video,
                    filename: title || video.filename, // Only update title if it changed
                    videoUrl: data.fileUrl || video.videoUrl, // Only update URL if new video uploaded
                  }
                : video
            )
          );
          setIsModalOpen(false); // Close the modal
        } else {
          console.error("Failed to update video");
        }
      })
      .catch((error) => console.error("Error updating video:", error));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center text-[#A64D79] mb-6">
        Uploaded Videos
      </h2>

      {videos.length === 0 ? (
        <p className="text-center text-gray-400">No videos found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="shadow-lg rounded-lg p-4 border border-gray-600"
            >
              <h3 className="text-lg font-semibold mb-2 text-black text-center">
                {video.filename}
              </h3>
              <VideoPlayer videoUrl={video.videoUrl} />
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleUpdate(video._id)}
                  className="bg-[#A64D79] text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(video._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for updating video */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Update Video</h3>
            <form onSubmit={handleSubmitUpdate}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="video" className="block text-sm font-medium mb-2">
                  New Video (optional)
                </label>
                <input
                  type="file"
                  id="video"
                  className="w-full p-2 border border-gray-300 rounded"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#A64D79] text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
