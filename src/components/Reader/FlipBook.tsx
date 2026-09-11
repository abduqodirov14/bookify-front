'use client';
import React, { useRef, useImperativeHandle, forwardRef, ReactNode } from 'react';
import HTMLFlipBook from 'react-pageflip';

interface Props {
  width: number;
  height: number;
  children: ReactNode;
  onFlip?: (e: { data: number }) => void;
}

export const FlipBook = forwardRef((props: Props, ref) => {
  const flipRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    pageFlip: () => flipRef.current?.pageFlip()
  }));

  const FlipComp = HTMLFlipBook as any;

  return (
    <FlipComp
      ref={flipRef}
      width={props.width}
      height={props.height}
      size="stretch"
      minWidth={315}
      maxWidth={1000}
      minHeight={400}
      maxHeight={1533}
      maxShadowOpacity={0.5}
      showCover={true}
      mobileScrollSupport={true}
      onFlip={props.onFlip}
      className="book-flip-container"
      style={{ margin: '0 auto' }}
    >
      {props.children}
    </FlipComp>
  );
});

FlipBook.displayName = 'FlipBook';