"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import { fal } from "@fal-ai/client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ModelIcon } from "@/components/icons/model-icon";
import Link from "next/link";

const DEFAULT_PROMPT =
  "A cinematic shot of a baby raccoon wearing an intricate italian priest robe";

function randomSeed() {
  return Math.floor(Math.random() * 10000000).toFixed(0);
}

fal.config({
  credentials: process.env.FAL_KEY,
});



export default function Lightning() {
  const [image, setImage] = useState<null | string>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [seed, setSeed] = useState<string>(randomSeed());
  const [inferenceTime, setInferenceTime] = useState<number>(NaN);



  const timer = useRef<any | undefined>(undefined);

  const handleOnChange = async (prompt: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setPrompt(prompt);
    const input = {
      prompt: prompt,
      image_size: "square_hd" as const,
      style: "realistic_image" as const,
      enable_safety_checker: true,
    };
    const result = await fal.subscribe("fal-ai/recraft/v3/text-to-image", {
      input: input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    setImage(result.data.images[0].url);
    setInferenceTime(0); // API doesn't provide timings
    timer.current = setTimeout(async () => {
      const result2 = await fal.subscribe("fal-ai/recraft/v3/text-to-image", {
        input: input,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      setImage(result2.data.images[0].url);
      setInferenceTime(0);
    }, 500);
  };

  useEffect(() => {
    const fetchInitialImage = async () => {
      if (typeof window !== "undefined") {
        window.document.cookie = "fal-app=true; path=/; samesite=strict; secure;";
      }
      // initial image
      const input = {
        prompt: prompt,
        image_size: "square_hd" as const,
        style: "realistic_image" as const,
        enable_safety_checker: true,
      };
      const result = await fal.subscribe("fal-ai/recraft/v3/text-to-image", {
        input: input,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      setImage(result.data.images[0].url);
      setInferenceTime(0);
    };
    fetchInitialImage();
  }, []);

  return (
    <main>
      <div className="flex flex-col justify-between h-[calc(100vh-56px)]">
        <div className="py-4 md:py-10 px-0 space-y-4 lg:space-y-8 mx-auto w-full max-w-xl">
          <div className="container px-3 md:px-0 flex flex-col space-y-2">
            <div className="flex flex-col max-md:space-y-4 md:flex-row md:space-x-4 max-w-full">
              <div className="flex-1 space-y-1">
                <label>Prompt</label>
                <Input
                  onChange={(e) => {
                    handleOnChange(e.target.value);
                  }}
                  className="font-light w-full"
                  placeholder="Type something..."
                  value={prompt}
                />
              </div>
            </div>
          </div>
          <div className="container flex flex-col space-y-6 lg:flex-row lg:space-y-0 p-3 md:p-0">
            <div className="flex-1 flex-col flex items-center justify-center">
              {image && inferenceTime && (
                <div className="flex flex-row space-x-1 text-sm w-full mb-2">
                  <span className="text-neutral-500">Inference time:</span>
                  <span
                    className={
                      !inferenceTime ? "text-neutral-500" : "text-green-400"
                    }
                  >
                    {inferenceTime
                      ? `${(inferenceTime * 1000).toFixed(0)}ms`
                      : `n/a`}
                  </span>
                </div>
              )}
              <div className="md:min-h-[512px] max-w-fit">
                {image && (
                  <img id="imageDisplay" src={image} alt="Dynamic Image" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="container flex flex-col items-center justify-center my-4">
        <div id="footer" className="flex flex-col items-center" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', padding: '50px' }}>
    <div className="text-gray-500 mb-2" style={{fontSize: '1.2em'}}><strong>Developed By PIYUSH PAL</strong></div>
      <div className="flex space-x-4">
        <a href="https://github.com/Pal7696" style={{ textDecoration: "none" }}>
          <img src="https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_960_720.png" alt="github" className="h-6 w-6 hover:opacity-75 transition-opacity duration-200" style={{ width: '30px', height: '30px' }} />
        </a>
        <a href="https://www.linkedin.com/in/piyush-pal-55a254291" style={{ textDecoration: "none" }}>
          <img src="https://banner2.cleanpng.com/20180717/ls/7a791a7183478843b347a5d17fc79e13.webp" alt="linkedin" className="h-6 w-6 hover:opacity-75 transition-opacity duration-200" style={{ width: '30px', height: '30px' }} />
        </a>
        <a href="https://www.instagram.com/the_piyushpal/" style={{ textDecoration: "none" }}>
          <img src="https://img.freepik.com/premium-vector/instagram-vector-logo-icon-social-media-logotype_901408-392.jpg?semt=ais_hybrid" alt="instagram" className="h-6 w-6 hover:opacity-75 transition-opacity duration-200" style={{ width: '30px', height: '30px' }} />
        </a>
      </div> 
  </div>
        </div>
      </div>
    </main>
  );
}
