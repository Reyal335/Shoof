// What the follows module announces after a write commits. Sent only when the follow actually changed, so
// following someone twice doesn't notify them twice.
export const FollowEvents = {
  Followed: 'user.followed',
  Unfollowed: 'user.unfollowed',
} as const;

/** followerId started following followingId. */
export interface UserFollowedEvent {
  followerId: string;
  followingId: string;
}

export interface UserUnfollowedEvent {
  followerId: string;
  followingId: string;
}
