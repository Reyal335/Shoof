import { UsersService } from "../users/users.service.js";
import { PostsService } from "./posts.service.js";
import { ListPostsQueryDto } from "./dto/query.dto.js";
export declare class UserPostsController {
    private readonly usersService;
    private readonly postsService;
    constructor(usersService: UsersService, postsService: PostsService);
    listByUsername(username: string, query: ListPostsQueryDto): Promise<import("./posts.service.js").Page<import("./posts.service.js").PostView>>;
}
