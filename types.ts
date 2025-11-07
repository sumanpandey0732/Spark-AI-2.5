
import React from 'react';

export type FeatureId =
  | 'chat'
  | 'spark-search'
  | 'spark-pro'
  | 'image-generator'
  | 'image-editor'
  | 'image-analyzer'
  | 'video-generator'
  | 'video-analyzer';

export interface Feature {
  id: FeatureId;
  name: string;
  description: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  citations?: Citation[];
}

export interface Citation {
  uri: string;
  title: string;
}

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type VideoAspectRatio = '16:9' | '9:16';