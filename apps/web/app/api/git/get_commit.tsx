import type { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO_OWNER = 'virginus01';
const REPO_NAME = 'next_afo_web';
const BASE_BRANCH = 'main';

export default async function server_get_commits(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${BASE_BRANCH}&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch commits' });
    }

    const commits = await response.json();

    const filtered = commits
      .map((commit: any) => {
        const message = commit.commit.message;
        const wordCount = message.trim().split(/\s+/).length;

        if (wordCount < 5) return null;

        return {
          hash: commit.sha,
          author: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          message,
          url: commit.html_url,
        };
      })
      .filter(Boolean); // Remove nulls

    return res.status(200).json(filtered);
  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
