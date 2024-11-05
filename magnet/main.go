package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/storage"
)

func main() {
	http.HandleFunc("/stream", streamHandler)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "/app/public/index.html")
	})

	fmt.Println("Starting server on :8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func streamHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the magnet link from the request
	magnetLink := r.URL.Query().Get("magnet")
	if magnetLink == "" {
		http.Error(w, "Missing magnet link", http.StatusBadRequest)
		return
	}

	// Directory to store the HLS output
	hlsOutputDir := "./hls"
	os.MkdirAll(hlsOutputDir, os.ModePerm)

	// Generate a unique filename for this session
	streamID := time.Now().Format("20060102150405")
	hlsOutput := filepath.Join(hlsOutputDir, streamID+".m3u8")

	// Start torrent client
	clientConfig := torrent.NewDefaultClientConfig()
	clientConfig.DataDir = "./downloads"
	clientConfig.NoDHT = false // Enable DHT
	clientConfig.Seed = false  // Disable seeding
	clientConfig.DisableTrackers = false
	clientConfig.Debug = false
	clientConfig.DefaultStorage = storage.NewFile("./downloads")

	client, err := torrent.NewClient(clientConfig)
	if err != nil {
		http.Error(w, "Failed to start Torrent client", http.StatusInternalServerError)
		log.Println("Torrent client error:", err)
		return
	}
	defer client.Close()

	// Add the magnet link to the torrent client
	t, err := client.AddMagnet(magnetLink)
	if err != nil {
		http.Error(w, "Failed to add magnet link", http.StatusInternalServerError)
		log.Println("Failed to add magnet link:", err)
		return
	}

	// Wait for metadata to download
	<-t.GotInfo()
	t.DownloadAll() // Download all files in the torrent

	// Select the largest video file from the torrent
	file := selectLargestVideoFile(t)
	if file == nil {
		http.Error(w, "No video file found in torrent", http.StatusNotFound)
		log.Println("No video file found in torrent")
		return
	}

	log.Printf("Selected file: %s", file.DisplayPath())

	// Enable sequential download for better streaming
	file.SetPriority(torrent.PiecePriorityHigh)
	// file.SetSequentialDownload(true)

	// Wait until at least 5% of the file is downloaded
	for file.BytesCompleted() < file.Length()/20 { // 5%
		log.Printf("Waiting for download: %d/%d bytes completed", file.BytesCompleted(), file.Length())
		time.Sleep(2 * time.Second)
	}
	log.Printf("Enough of the file has been downloaded to start streaming: %d/%d bytes completed", file.BytesCompleted(), file.Length())

	// Wait for the first piece of the file to download
	reader := file.NewReader()
	defer reader.Close()

	// Start FFmpeg to convert the torrent stream to HLS format
	ffmpegCmd := exec.Command("ffmpeg", "-i", "pipe:0", "-codec:", "copy", "-start_number", "0", "-hls_time", "10", "-hls_list_size", "0", "-f", "hls", hlsOutput)
	ffmpegCmd.Stdin = reader
	ffmpegCmd.Stdout = os.Stdout
	ffmpegCmd.Stderr = os.Stderr

	// Start FFmpeg
	if err := ffmpegCmd.Start(); err != nil {
		http.Error(w, "Failed to start FFmpeg", http.StatusInternalServerError)
		log.Println("FFmpeg error:", err)
		return
	}

	// Serve the HLS stream
	serveHLS(w, r, streamID)

	// Wait for FFmpeg to finish
	go func() {
		if err := ffmpegCmd.Wait(); err != nil {
			log.Println("FFmpeg finished with error:", err)
		}
	}()
}

// serveHLS serves the HLS stream to the client
func serveHLS(w http.ResponseWriter, r *http.Request, streamID string) {
	hlsFile := filepath.Join("./hls", streamID+".m3u8")

	if _, err := os.Stat(hlsFile); err != nil {
		http.Error(w, "HLS stream not found", http.StatusNotFound)
		log.Println("HLS file not found:", err)
		return
	}

	log.Println("Serving HLS file:", hlsFile)
	http.ServeFile(w, r, hlsFile)
}

// selectLargestVideoFile selects the largest video file from the torrent
func selectLargestVideoFile(t *torrent.Torrent) *torrent.File {
	var largestFile *torrent.File
	for _, file := range t.Files() {
		if isVideoFile(file.DisplayPath()) && (largestFile == nil || file.Length() > largestFile.Length()) {
			largestFile = file
		}
	}
	return largestFile
}

// isVideoFile checks if the file is a video based on its extension
func isVideoFile(path string) bool {
	ext := filepath.Ext(path)
	switch ext {
	case ".mp4", ".mkv", ".avi", ".mov", ".flv":
		return true
	default:
		return false
	}
}
