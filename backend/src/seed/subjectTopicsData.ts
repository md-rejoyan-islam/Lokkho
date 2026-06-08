// Subject → topic/note helpers.
//
// The DATA lives in JSON (loaded below); this file only holds the lookup logic.
//   • topicLibrary.json — syllabus-accurate topic list per subject key
//   • topicNotes.json   — a short study note per subject key
import TOPIC_LIBRARY from "../../data/topicLibrary.json";
import NOTES from "../../data/topicNotes.json";

type SubjectKey = keyof typeof TOPIC_LIBRARY;

function keyForSection(name: string): SubjectKey | null {
  const n = name.toLowerCase();
  // Order matters for overlapping names.
  if (n.includes("bangladesh")) return "bdaffairs";
  if (n.includes("international")) return "intaffairs";
  if (n.includes("english")) return "english";
  if (n.includes("bangla")) return "bangla";
  if (n.includes("math") || n.includes("analytical")) return "math";
  if (n.includes("mental")) return "mental";
  if (n.includes("science")) return "science";
  if (n.includes("geograph")) return "geography";
  if (n.includes("ethic") || n.includes("governance")) return "ethics";
  if (n.includes("ict") || n.includes("computer")) return "ict";
  if (n.includes("pedagog")) return "pedagogy";
  if (n.includes("general knowledge") || n.includes("gk")) return "gk";
  return null;
}

export function topicsForSection(name: string): string[] {
  const k = keyForSection(name);
  return k ? TOPIC_LIBRARY[k] : [];
}

export function noteForSection(name: string): string {
  const k = keyForSection(name);
  return k ? (NOTES as Record<string, string>)[k] : "";
}
