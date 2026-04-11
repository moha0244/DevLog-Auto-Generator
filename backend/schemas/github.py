from pydantic import BaseModel
from typing import List, Optional


class LanguageBreakdown(BaseModel):
    name: str
    count: int


class CommitSummary(BaseModel):
    totalCommits: int
    languageBreakdown: List[LanguageBreakdown]


class Commit(BaseModel):
    id: str
    sha: str
    fullSha: str
    message: str
    date: Optional[str]
    displayDate: str
    author: str
    url: str
    filesChanged: int
    languages: List[str]
    selected: bool


class GitHubCommitsResponse(BaseModel):
    summary: CommitSummary
    commits: List[Commit]
    error: Optional[str] = None


class GitHubRequest(BaseModel):
    repo_name: str
    token: Optional[str] = None
    days: int = 7
    author: Optional[str] = None
