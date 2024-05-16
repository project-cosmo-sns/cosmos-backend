export enum ListSortBy {
  //전체
  ALL = 'ALL',
  //팔로우
  BY_FOLLOW = 'BY_FOLLOW',
  //기수
  BY_GENERATION = 'BY_GENERATION',
}

export enum NotificationType {
  CREATE_FEED_COMMENT = 'CREATE_FEED_COMMENT',
  CREATE_POST_COMMENT = 'CREATE_POST_COMMENT',
  CREATE_FEED_EMOJI = 'CREATE_FEED_EMOJI',
  CREATE_POST_EMOJI = 'CREATE_POST_EMOJI',
  FOLLOW = 'FOLLOW',
}

export enum EmojiType {
  HEART = 'HEART',
  THUMBSUP = 'THUMBSUP',
  LAUGH = 'LAUGH',
  SAD = 'SAD',
  CHECK = 'CHECK',
  ME = 'ME',
}

export enum NotificationSettingType {
  COMMENT = 'COMMENT',
  EMOJI = 'EMOJI',
  FOLLOW = 'FOLLOW',
}

export enum CategoryType {
  NOTICE = 'NOTICE',
  EVENT = 'EVENT',
  SPECIAL_LECTURE = 'SPECIAL_LECTURE',
  INFORMATION_SHARING = 'INFORMATION_SHARING',
  TODAYS_QUESTION = 'TODAYS_QUESTION',
}

export enum AuthorizationStatusType {
  NONE = 'NONE',
  PENDING = 'PENDING',
  ACCEPT = 'ACCEPT',
}

export enum AuthorizationJudgeType {
  NONE = 'NONE',
  DECLINE = 'DECLINE',
  ACCEPT = 'ACCEPT',
}