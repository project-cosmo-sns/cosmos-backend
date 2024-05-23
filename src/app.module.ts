import { Logger, Module } from '@nestjs/common';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeORMConfigService } from 'src/database/database.config';

import { CommonModule } from './common/common.module';

import { PassportModule } from '@nestjs/passport';
import { SessionSerializerService } from './service/session-serializer.service';
import { RolesGuard } from './guard/roles.guard';
import { MemberQueryRepository } from './repository/member.query-repository';
import { GithubAuthGuard } from './guard/github-auth.guard';
import { GithubStrategy } from './strategy/github-strategy';
import { OauthAuthenticationController } from './controller/oauth.controller';
import { OauthAuthenticationService } from './service/oauth-authentication.service';
import { Member } from './entity/member.entity';
import { FeedService } from './service/feed.service';
import { FeedController } from './controller/feed.controller';
import { Feed } from './entity/feed.entity';
import { FeedQueryRepository } from './repository/feed.query-repository';
import { Post } from './entity/post.entity';
import { PostHashTag } from './entity/post_hash_tag.entity';
import { HashTag } from './entity/hash_tag.entity';
import { PostService } from './service/post.service';
import { PostController } from './controller/post.controller';
import { Follow } from './entity/follow.entity';
import { PostQueryRepository } from './repository/post.query-repository';
import { FeedComment } from './entity/feed_comment.entity';
import { FeedCommentService } from './service/feed-comment.service';
import { FeedCommentQueryRepository } from './repository/feed-comment.query-repository';
import { FeedCommentHeart } from './entity/feed_comment_heart';
import { PostComment } from './entity/post_comment.entity';
import { PostCommentHeart } from './entity/post_comment_heart.entity';
import { PostView } from './entity/post_view.entity';
import { ImageService } from './service/image.service';
import { PostEmoji } from './entity/post_emoji.entity';
import { FollowController } from './controller/follow.controller';
import { FollowService } from './service/follow.service';
import { FollowQueryRepository } from './repository/follow.query-repository';
import { FeedEmoji } from './entity/feed_emoji.entity';
import { Notification } from './entity/notification.entity';
import { NotificationController } from './controller/notification.controller';
import { NotificationService } from './service/notification.service';
import { NotificationQueryRepository } from './repository/notification.query-repository';
import { SearchController } from './controller/search.controller';
import { SearchService } from './service/search.service';
import { SearchQueryRepository } from './repository/search.query-repository';
import { ProfileController } from './controller/profile.controller';
import { ProfileService } from './service/profile.service';
import { ProfileQueryRepository } from './repository/profile.query-repository';
import { FeedDomainService } from './domain-service/feed.domain-service';
import { FeedImage } from './entity/feed_image.entity';
import { MemberController } from './controller/member.controller';
import { FeedEmojiQueryRepository } from './repository/feed-emoji.query-repository';
import { PostEmojiQueryRepository } from './repository/post-emoji.query-repository';
import { PostHashTagQueryRepository } from './repository/post-hash-tag.query-repository';
import { PostCommentQueryRepository } from './repository/post-comment.query-repository';
import { PostDomainService } from './domain-service/post.domain-service';
import { Authorization } from './entity/authorization.entity';
import { AuthorizationController } from './controller/authorization.controller';
import { AuthorizationService } from './service/authorization.service';
import { NotificationDomainService } from './domain-service/notification.domain-service';
import { MemberDomainService } from './domain-service/member.domain-service';
import { AdminController } from './controller/admin.controller';
import { AuthorizationQueryRepository } from './repository/authorization.query-repository';
import { GoogleStrategy } from './strategy/google-strategy';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { AdminGuard } from './guard/admin.guard';
import { PostScrap } from './entity/post_scrap.entity';
import { PostReply } from './entity/post_reply.entity';
import { PostReplyHeart } from './entity/post_reply_heart.entity';
import { FeedReply } from './entity/feed_reply.entity';
import { FeedReplyHeart } from './entity/feed_reply_heart.entity';
import { PostReplyService } from './service/post-reply.service';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeORMConfigService,
    }),
    TypeOrmModule.forFeature([
      Member,
      Feed,
      FeedImage,
      FeedEmoji,
      FeedComment,
      FeedCommentHeart,
      FeedReply,
      FeedReplyHeart,
      Post,
      PostComment,
      PostCommentHeart,
      PostReply,
      PostReplyHeart,
      PostScrap,
      PostHashTag,
      HashTag,
      Follow,
      PostView,
      PostEmoji,
      Notification,
      Authorization,
    ]),
    PassportModule.register({
      session: true,
    }),
  ],
  controllers: [
    AppController,
    OauthAuthenticationController,
    FeedController,
    PostController,
    FollowController,
    NotificationController,
    SearchController,
    ProfileController,
    MemberController,
    AuthorizationController,
    AdminController,
  ],
  providers: [
    // Service
    AppService,
    SessionSerializerService,
    OauthAuthenticationService,
    FeedService,
    FeedCommentService,
    PostService,
    PostReplyService,
    ImageService,
    FollowService,
    NotificationService,
    SearchService,
    ProfileService,
    AuthorizationService,

    // DomainService
    FeedDomainService,
    PostDomainService,
    MemberDomainService,
    NotificationDomainService,

    // QueryRepository
    MemberQueryRepository,
    FeedQueryRepository,
    FeedCommentQueryRepository,
    PostQueryRepository,
    PostCommentQueryRepository,
    FollowQueryRepository,
    NotificationQueryRepository,
    SearchQueryRepository,
    ProfileQueryRepository,
    PostHashTagQueryRepository,
    FeedEmojiQueryRepository,
    PostEmojiQueryRepository,
    AuthorizationQueryRepository,

    // Strategy
    GithubStrategy,
    GoogleStrategy,

    // Guard
    GithubAuthGuard,
    GoogleAuthGuard,
    RolesGuard,
    AdminGuard,

    // ETC
    Logger,
  ],
})
export class AppModule { }
