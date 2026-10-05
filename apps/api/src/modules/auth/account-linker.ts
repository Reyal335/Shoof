// import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
// import {
//   AuthenticationRegistry,
//   OidcAccountResolver,
//   type OAuthTokens,
//   type OidcProfile,
//   type OidcResolveContext,
// } from '@nestjs/authentication';
// import { UsersService } from '../users/users.service.js';

// @Injectable()
// export class AccountLinker extends OidcAccountResolver {
//     constructor(
//         private readonly usersService: UsersService,
//         registry: AuthenticationRegistry
//     ) {
//         super();
//         registry.registerHandler('oidc', this)
//     }

//     async resolveUser(profile: OidcProfile, _tokens: OAuthTokens, { linkTo }: OidcResolveContext) {
//         const linked = await this.usersService.findByIdentity(profile.provider, profile.subject);

//         if (linkTo) {
//             if (linked && linked.id !== linkTo.id) {
//                 throw new ConflictException('This Google accounts belongs to another customer');
//             }
//             return this.usersService.linkIdentity(linkTo.id, profile.provider, profile.subject)
//         }

//         if (linked) {
//             return linked;
//         }

//         if (!profile.email || !profile.emailVerified) {
//             return null
//         }
//         const existing = await this.usersService.findByEmail(profile.email)
//         if(!existing) {
//             const user = await this.usersService({
//                 email: profile.email,
//                 emailVerified: true
//             })
//         }
//     }
// }

