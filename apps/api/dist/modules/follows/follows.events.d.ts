export declare const FollowEvents: {
    readonly Followed: "user.followed";
    readonly Unfollowed: "user.unfollowed";
};
export interface UserFollowedEvent {
    followerId: string;
    followingId: string;
}
export interface UserUnfollowedEvent {
    followerId: string;
    followingId: string;
}
