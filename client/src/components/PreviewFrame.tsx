import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  console.log("files are here:", files);

  const [url, setUrl] = useState("");
  const [runningProcess, setRunningProcess] = useState<any>(null); // Store process reference

  async function main() {
    try {
      console.log("Starting npm install...");
      const installProcess = await webContainer.spawn('npm', ['install']);

      // Capture install output
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      await installProcess.exit; // Ensure install completes before starting the server
      console.log("npm install completed, starting server...");

      const startProcess = await webContainer.spawn('npm', ['start']);
      setRunningProcess(startProcess); // Store reference to terminate later

      // Capture server URL
      webContainer.on('server-ready', (port, url) => {
        console.log("Server ready at:", url);
        setUrl(url);
      });
    } catch (error) {
      console.error("Error in web container:", error);
    }
  }

  function terminateProcess() {
    if (runningProcess) {
      runningProcess.kill(); // Terminates the running process
      setRunningProcess(null);
      setUrl(""); // Clear URL since the process is terminated
      console.log("Process terminated.");
    }
  }

  useEffect(() => {
    main();
    return () => terminateProcess(); // Cleanup process when unmounting
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width="100%" height="100%" src={url} />}

      {/* Terminate Process Button */}
      {runningProcess && (
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          onClick={terminateProcess}
        >
          Terminate Server
        </button>
      )}
    </div>
  );
}
