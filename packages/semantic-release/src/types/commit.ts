export interface Commit {
  commit: CommitSHA;
  tree: CommitSHA;
  author: CommitAuthor;
  committer: CommitAuthor;
  subject: string;
  body: string;
  hash: string;
  committerDate: Date;
  message: string;
  gitTags: string;
}

export interface CommitSHA {
  long: string;
  short: string;
}

export interface CommitAuthor {
  name: string;
  email: string;
  date: Date;
}
