"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createGitHubClient } from "@/app/lib/github";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testToken, setTestToken] = useState<string>("");
  const [testResults, setTestResults] = useState<any>(null);

  const fetchData = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const githubClient = createGitHubClient(
        (session as any).accessToken as string
      );

      // Fetch repositories
      const repositories = await githubClient.getUserRepositories();
      setRepos(repositories);

      // Fetch organizations
      const response = await fetch("https://api.github.com/user/orgs", {
        headers: {
          Authorization: `token ${(session as any).accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        const organizations = await response.json();
        setOrgs(organizations);
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to fetch organizations:",
          response.status,
          errorText
        );
        setError(
          `Failed to fetch organizations: ${response.status} - ${errorText}`
        );
      }
    } catch (err) {
      setError("Failed to fetch data: " + (err as Error).message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const testWithToken = async () => {
    if (!testToken.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Test organizations
      const orgResponse = await fetch("https://api.github.com/user/orgs", {
        headers: {
          Authorization: `token ${testToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      // Test repositories
      const repoResponse = await fetch(
        "https://api.github.com/user/repos?type=all",
        {
          headers: {
            Authorization: `token ${testToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      // Test user info
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${testToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      const results = {
        organizations: orgResponse.ok
          ? await orgResponse.json()
          : { error: `Status ${orgResponse.status}` },
        repositories: repoResponse.ok
          ? await repoResponse.json()
          : { error: `Status ${repoResponse.status}` },
        user: userResponse.ok
          ? await userResponse.json()
          : { error: `Status ${userResponse.status}` },
      };

      setTestResults(results);
    } catch (err) {
      setError("Failed to test with token: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to see debug information</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        GitHub Access Debug
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "Loading..." : "Refresh OAuth Data"}
        </Button>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <input
            type="password"
            placeholder="Personal Access Token"
            value={testToken}
            onChange={(e) => setTestToken(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minWidth: "300px",
            }}
          />
          <Button
            onClick={testWithToken}
            disabled={loading || !testToken.trim()}
          >
            Test with Token
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Organizations */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Organizations ({orgs.length})
          </Typography>
          <List>
            {orgs.map((org) => (
              <ListItem key={org.id}>
                <ListItemText
                  primary={org.login}
                  secondary={`ID: ${org.id} | Type: ${org.type}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Repositories */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Repositories ({repos.length})
          </Typography>
          <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
            {repos.map((repo) => (
              <ListItem key={repo.id}>
                <ListItemText
                  primary={repo.full_name}
                  secondary={`Private: ${repo.private} | Owner: ${repo.owner.type}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Test Results */}
      {testResults && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personal Access Token Test Results
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Organizations:</Typography>
              <pre
                style={{
                  fontSize: "12px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {JSON.stringify(testResults.organizations, null, 2)}
              </pre>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Repositories Count:</Typography>
              <Typography variant="body2">
                {Array.isArray(testResults.repositories)
                  ? testResults.repositories.length
                  : "Error"}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                User Info:
              </Typography>
              <pre
                style={{
                  fontSize: "12px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {JSON.stringify(testResults.user, null, 2)}
              </pre>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Access Token Info */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Info
        </Typography>
        <Typography variant="body2">
          <strong>User:</strong> {session.user?.name} ({session.user?.email})
        </Typography>
        <Typography variant="body2">
          <strong>Has Access Token:</strong>{" "}
          {session.accessToken ? "Yes" : "No"}
        </Typography>
        <Typography variant="body2">
          <strong>Token Preview:</strong>{" "}
          {session.accessToken
            ? `${(session.accessToken as string).substring(0, 10)}...`
            : "None"}
        </Typography>
      </Paper>
    </Container>
  );
}
