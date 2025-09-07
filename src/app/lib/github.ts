import { Octokit } from "octokit";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  private: boolean;
  updated_at: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
        type: "all", // Include all repository types (public, private, forks, sources, member)
      });
      return data as GitHubRepository[];
    } catch (error) {
      console.error("Error fetching user repositories:", error);
      throw new Error("Failed to fetch repositories");
    }
  }

  async getRepositoryPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open"
  ): Promise<PullRequest[]> {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state,
        sort: "updated",
        direction: "desc",
        per_page: 100,
      });
      return data as PullRequest[];
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      throw new Error("Failed to fetch pull requests");
    }
  }

  async getPullRequestDetails(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<PullRequest> {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });
      return data as PullRequest;
    } catch (error) {
      console.error("Error fetching pull request details:", error);
      throw new Error("Failed to fetch pull request details");
    }
  }

  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<PullRequestFile[]> {
    try {
      const { data } = await this.octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      });
      return data as PullRequestFile[];
    } catch (error) {
      console.error("Error fetching pull request files:", error);
      throw new Error("Failed to fetch pull request files");
    }
  }

  async getPullRequestDiff(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<string> {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: {
          format: "diff",
        },
      });
      return data as unknown as string;
    } catch (error) {
      console.error("Error fetching pull request diff:", error);
      throw new Error("Failed to fetch pull request diff");
    }
  }
}

export function createGitHubClient(accessToken: string): GitHubClient {
  return new GitHubClient(accessToken);
}

// Helper function to get GitHub client from auth store or session
export function getGitHubClient(): GitHubClient | null {
  // Try to get from auth store first (PAT auth)
  if (typeof window !== "undefined") {
    const authStore = require("@/app/store/authStore").useAuthStore.getState();
    if (authStore.accessToken) {
      return new GitHubClient(authStore.accessToken);
    }
  }

  return null;
}
