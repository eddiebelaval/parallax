/**
 * Creator / Godmode utilities
 *
 * Eddie Belaval is the creator of Parallax. When logged in with
 * his account, the app recognizes him and enables special features.
 */

const CREATOR_EMAILS = [
  'eddie.belaval@gmail.com',
  'eb@id8labs.tech',
]

/** Check if a user email belongs to the creator. */
export function isCreator(email: string | undefined | null): boolean {
  if (!email) return false
  return CREATOR_EMAILS.includes(email.toLowerCase())
}
