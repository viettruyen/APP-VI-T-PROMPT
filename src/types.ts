export interface Scene {
  id: string;
  content: string; // The full content text with characters tag in parentheses at the end, e.g. "... (Nam tử)"
  textOnly: string; // Just the clean story text
  characters: string; // comma-separated names of characters
}

export interface DNAProfile {
  id: string;
  name: string; // Vietnamese name
  type: "character" | "object" | "setting";
  description: string; // English character design details (250+ words for characters ending with the required Donghua style string)
}

export interface GeneratedPrompt {
  sceneId: string;
  prompt: string; // The full 11-part string separated by '|'
}

export interface YouTubeSummary {
  index: number;
  text: string;
}

export interface YouTubeDescription {
  thumbnailTitle: string;
  videoTitle: string;
  summaries: YouTubeSummary[];
  warning: string;
  connection: string;
  hashtags: string;
}
