"use client";

import React, { useRef } from "react";
import { ReactFlipBook } from "@vuvandinh203/react-flipbook";

export default function FlipBook(props: any) {
  const { pages, onFlip, onChangeState } = props;
  const bookRef = useRef<any>(null);

  return (
    <ReactFlipBook
      width={850}
      height={900}
      size="stretch"
      minWidth={315}
      maxWidth={2000}
      minHeight={400}
      maxHeight={2000}
      maxShadowOpacity={0.3}
      showCover={false}
      mobileScrollSupport={true}
      className="book-container"
      ref={bookRef}
      onFlip={(e: any) => {
        if (onFlip) onFlip(e.data);
      }}
      onChangeState={(e: any) => {
        if (onChangeState) onChangeState(e.data);
      }}
    >
      {pages.map((page: React.ReactNode, index: number) => (
        <div key={index} className="page bg-[#FAFAFA] h-full w-full">
          {page}
        </div>
      ))}
    </ReactFlipBook>
  );
}