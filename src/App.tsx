import { useEffect, useState } from "react";
import { UploadFile } from "./components/UploadFile";
import { Button, Label, Select, TextInput, Toast } from "flowbite-react";

function App() {
  const API_URL = "https://api-live.teknokreasi.site/api/live";
  const [file, setFile] = useState<File | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dataVideo, setDataVideo] = useState<string[] | null>(null);

  // New state for selected video and stream key
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState<string>("");

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const resetForm = () => {
    setSelectedVideo(null);
    setStreamKey("");
  }

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("video", file);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/video`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        showToast("File uploaded successfully!", "success");
        setFile(null);
        setVideoUrl(null);
        getDataVideo();
      } else {
        showToast(`Error uploading file: ${await response.text()}`, "error");
      }
    } catch (error) {
      showToast("Error in upload: " + error, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartStreaming = async () => {
    setStreamLoading(true);
    if (!selectedVideo || !streamKey) {
      showToast("Please select a video and provide a stream key.", "error");
      setStreamLoading(false);
      return;
    }

    const requestBody = {
      objectName: selectedVideo,
      streamKey: streamKey,
    };

    try {
      const response = await fetch(`${API_URL}/stream-youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        showToast(`Streaming started`, "success");
        setStreamLoading(false);
        resetForm();
      } else {
        showToast(`Error starting stream: ${await response.text()}`, "error");
        setStreamLoading(false);
      }
    } catch (error) {
      showToast("Error in starting stream: " + error, "error");
      resetForm();
      setStreamLoading(false);
    }
  };

  const getDataVideo = async () => {
    fetch(`${API_URL}/videos`)
      .then((response) => response.json())
      .then((data) => {
        setDataVideo(data?.data);
      });
  };

  useEffect(() => {
    getDataVideo();
  }, []);

  return (
    <main>
      <div className="flex w-full justify-end">
        {toastVisible && (
          <Toast
            className={`absolute z-10 mx-7 mt-10 ${toastType === "success" ? "bg-green-500" : "bg-red-500"}`}
          >
            <div className="text-white">{toastMessage}</div>
          </Toast>
        )}
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 dark:bg-gray-800">
        <div className="my-5 flex w-11/12 flex-col justify-center gap-5 rounded-lg bg-zinc-100 p-5 shadow-xl">
          <h1 className="text-center text-2xl dark:text-white">
            Tools Auto Live Stream
          </h1>
          <div className="p-10">
            <div>
              <div className="mb-5 block">
                <Label htmlFor="upload-video" value="Upload Files Video" />
              </div>
              <div className="m-auto" id="upload-video">
                <UploadFile
                  onFileChange={handleFileChange}
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                />
                {file && <p className="mt-2">Files Upload: {file.name}</p>}
                {file && (
                  <Button
                    size="md"
                    isProcessing={loading}
                    disabled={loading}
                    onClick={handleUpload}
                    className="mt-4 w-full"
                  >
                    Upload
                  </Button>
                )}
              </div>
            </div>
            <div className="my-5 block">
              <Label htmlFor="select-video" value="Start Streaming" />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                handleStartStreaming();
              }}
              className="mt-5 flex w-full items-center justify-center gap-3"
            >
              <div className="w-1/3">
                <div className="mb-2 block">
                  <Label htmlFor="select-video" value="Select Video" />
                </div>
                <div>
                  <Select
                    id="select-video"
                    required
                    onChange={(e) => setSelectedVideo(e.target.value)}
                  >
                    <option value="">Select a video</option>
                    {dataVideo?.map((video, index) => (
                      <option key={index} value={video}>
                        {video}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="w-1/3">
                <div className="mb-2 block">
                  <Label htmlFor="stream-key" value="Stream Key" />
                </div>
                <div>
                  <TextInput
                    id="stream-key"
                    type="text"
                    required
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)} // Update stream key
                  />
                </div>
              </div>
              <div className="mt-8 w-1/3">
                <Button
                  color="success"
                  size={"sm"}
                  type="submit"
                  disabled={streamLoading}
                  isProcessing={streamLoading}
                >
                  Start Streaming
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
