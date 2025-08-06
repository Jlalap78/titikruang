'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import EmojiMart (client-only)
const Picker = dynamic(() =>
  import('@emoji-mart/react').then((mod) => mod.Picker), {
  ssr: false
});

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="absolute bottom-12 left-0 z-50">
      <Picker
        onEmojiSelect={(emoji) => onSelect(emoji.native)}
        theme="light"
      />
    </div>
  );
}
