"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Grid,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Code,
  Person,
  CalendarToday,
  Add,
  Remove,
  Edit,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  createGitHubClient,
  PullRequest as PRType,
  PullRequestFile,
} from "@/app/lib/github";
import { useUIStore } from "@/app/store/uiStore";
import { useAuthStore } from "@/app/store/authStore";
import DiffModal from "@/app/components/ui/DiffModal";

export default function PRReviewPage() {
  const { data: session, status } = useSession();
  const { accessToken: patToken, isAuthenticated: patAuth } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { themeMode } = useUIStore();

  const [pullRequest, setPullRequest] = useState<PRType | null>(null);
  const [files, setFiles] = useState<PullRequestFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PullRequestFile | null>(
    null
  );
  const [fileDiff, setFileDiff] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const owner = params?.owner as string;
  const repo = params?.repoName as string;
  const prNumber = parseInt(params?.prNumber as string);

  // Check if user is authenticated (either OAuth or PAT)
  const isAuthenticated = status === "authenticated" || patAuth;
  const accessToken = patToken || (session as any)?.accessToken;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated" && !patAuth) {
      router.push("/");
    }
  }, [status, patAuth, router]);

  // Fetch PR details and files when authenticated
  useEffect(() => {
    if (accessToken && owner && repo && prNumber) {
      fetchPRDetails();
      fetchPRFiles();
    }
  }, [accessToken, owner, repo, prNumber]);

  // Remove the useEffect for fetching diff since we'll do it on click

  const fetchPRDetails = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const githubClient = createGitHubClient(accessToken as string);
      const pr = await githubClient.getPullRequestDetails(
        owner,
        repo,
        prNumber
      );
      setPullRequest(pr);
    } catch (err) {
      setError("Failed to fetch pull request details. Please try again.");
      console.error("Error fetching PR details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPRFiles = async () => {
    if (!accessToken) return;

    try {
      const githubClient = createGitHubClient(accessToken as string);
      const prFiles = await githubClient.getPullRequestFiles(
        owner,
        repo,
        prNumber
      );
      setFiles(prFiles);
    } catch (err) {
      setError("Failed to fetch pull request files. Please try again.");
      console.error("Error fetching PR files:", err);
    }
  };

  const fetchFileDiff = async (file: PullRequestFile) => {
    if (!accessToken) return;

    try {
      const githubClient = createGitHubClient(accessToken as string);
      const diff = await githubClient.getPullRequestDiff(owner, repo, prNumber);

      // Extract the diff for the selected file
      const lines = diff.split("\n");
      const fileStart = lines.findIndex((line) =>
        line.includes(`diff --git a/${file.filename}`)
      );
      const nextFileStart = lines.findIndex(
        (line, index) => index > fileStart && line.startsWith("diff --git a/")
      );

      const fileDiffLines =
        nextFileStart > fileStart
          ? lines.slice(fileStart, nextFileStart)
          : lines.slice(fileStart);

      setFileDiff(fileDiffLines.join("\n"));
      setSelectedFile(file);
      setDiffModalOpen(true);
    } catch (err) {
      setError("Failed to fetch file diff. Please try again.");
      console.error("Error fetching file diff:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return "📄";
      case "css":
      case "scss":
        return "🎨";
      case "html":
        return "🌐";
      case "json":
        return "📋";
      case "md":
        return "📝";
      default:
        return "📄";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "added":
        return "success";
      case "modified":
        return "warning";
      case "removed":
        return "error";
      default:
        return "default";
    }
  };

  if (status === "loading") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (status === "unauthenticated" && !patAuth) {
    return null; // Will redirect
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => router.push("/dashboard")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            Pull Request #{prNumber}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {owner}/{repo}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* PR Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            {loading && !pullRequest ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : pullRequest ? (
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Typography variant="h5" sx={{ fontWeight: "medium" }}>
                    {pullRequest.title}
                  </Typography>
                  <Chip
                    label={pullRequest.state}
                    color={pullRequest.state === "open" ? "success" : "default"}
                  />
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    src={pullRequest.user.avatar_url}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography variant="body2">
                    {pullRequest.user.login}
                  </Typography>
                  <CalendarToday sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(pullRequest.created_at)}
                  </Typography>
                </Box>

                {pullRequest.body && (
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {pullRequest.body}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Paper>
        </Grid>

        {/* Files List - Now Full Width */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
            >
              <Code />
              Files Changed ({files.length})
            </Typography>

            <Grid container spacing={2}>
              {files.map((file, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => fetchFileDiff(file)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {getFileIcon(file.filename)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            flexGrow: 1,
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={file.filename}
                        >
                          {file.filename}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={file.status}
                          size="small"
                          color={getStatusColor(file.status) as any}
                        />
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Add sx={{ fontSize: 14, color: "success.main" }} />
                        <Typography variant="caption" color="success.main">
                          +{file.additions}
                        </Typography>
                        <Remove sx={{ fontSize: 14, color: "error.main" }} />
                        <Typography variant="caption" color="error.main">
                          -{file.deletions}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({file.changes} changes)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Diff Modal */}
      <DiffModal
        open={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        fileName={selectedFile?.filename || ""}
        fileDiff={fileDiff}
      />
    </Container>
  );
}
