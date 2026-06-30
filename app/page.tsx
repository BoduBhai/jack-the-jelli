"use client";

import { CldImage } from "next-cloudinary";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Testing the Cloudinary Upload</h1>

      {/* The 'src' prop takes the Public ID. 
        Width and height are required for Next.js image optimization sizing,
        but Cloudinary will dynamically resize the actual served image to fit.
      */}
      <CldImage
        width="800"
        height="600"
        src="test_image_jguiag"
        sizes="100vw"
        alt="My test image upload"
        loading="eager"
        crop="fill" // Optional: ensures the image fills the 800x600 space nicely
      />
    </main>
  );
}
