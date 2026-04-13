import type { Note } from '../types';

const passwordLike = /\b(pass(word)?|pwd)\b\s*[:=]/i;
const usernameLike = /\b(user(name)?|login|email)\b\s*[:=]/i;
const urlLike = /\bhttps?:\/\/|www\./i;

export function noteLooksLikeCredential(note: Note) {
  const text = `${note.title}\n${note.content}`.slice(0, 50_000); // avoid huge scans
  const hasPass = passwordLike.test(text);
  const hasUser = usernameLike.test(text);
  const hasUrl = urlLike.test(text);
  return (hasPass && (hasUser || hasUrl)) || (hasPass && hasUser);
}

