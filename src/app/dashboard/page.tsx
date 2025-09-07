"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Grid,
  Paper,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Folder,
  Code,
  Person,
  CalendarToday,
  Code as CodeIcon,
  Search,
  Clear,
  Business,
  PublicOutlined,
  LockOutlined,
  Star,
  ForkRight,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  createGitHubClient,
  GitHubRepository,
  PullRequest as PRType,
} from "@/app/lib/github";
import { useAuthStore } from "@/app/store/authStore";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const {
    accessToken: patToken,
    isAuthenticated: patAuth,
    user: patUser,
  } = useAuthStore();
  const router = useRouter();
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<
    GitHubRepository[]
  >([]);
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(
    null
  );
  const [pullRequests, setPullRequests] = useState<PRType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [repoType, setRepoType] = useState<string>("all");

  // Check if user is authenticated (either OAuth or PAT)
  const isAuthenticated = status === "authenticated" || patAuth;
  const accessToken = patToken || (session as any)?.accessToken;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated" && !patAuth) {
      router.push("/");
    }
  }, [status, patAuth, router]);

  // Fetch repositories when authenticated
  useEffect(() => {
    if (accessToken) {
      fetchRepositories();
    }
  }, [accessToken]);

  const fetchRepositories = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const githubClient = createGitHubClient(accessToken as string);
      const repos = await githubClient.getUserRepositories();

      // Extract unique organizations
      const orgs = Array.from(new Set(repos.map((repo) => repo.owner.login)));
      setOrganizations(orgs);

      setRepositories(repos);
      setFilteredRepositories(repos);
    } catch (err) {
      setError("Failed to fetch repositories. Please try again.");
      console.error("Error fetching repositories:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPullRequests = async (repo: GitHubRepository) => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const githubClient = createGitHubClient(accessToken as string);
      const prs = await githubClient.getRepositoryPullRequests(
        repo.owner.login,
        repo.name
      );
      setPullRequests(prs);
      setSelectedRepo(repo);
    } catch (err) {
      setError("Failed to fetch pull requests. Please try again.");
      console.error("Error fetching pull requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePRClick = (pr: PRType) => {
    if (selectedRepo) {
      router.push(
        `/repo/${selectedRepo.owner.login}/${selectedRepo.name}/pr/${pr.number}`
      );
    }
  };

  // Filter repositories based on search, organization, and type
  useEffect(() => {
    let filtered = repositories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description &&
            repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by organization
    if (selectedOrg !== "all") {
      filtered = filtered.filter((repo) => repo.owner.login === selectedOrg);
    }

    // Filter by repository type
    if (repoType !== "all") {
      if (repoType === "private") {
        filtered = filtered.filter((repo) => repo.private);
      } else if (repoType === "public") {
        filtered = filtered.filter((repo) => !repo.private);
      }
    }

    setFilteredRepositories(filtered);
  }, [repositories, searchTerm, selectedOrg, repoType]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedOrg("all");
    setRepoType("all");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your repositories and review pull requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Search />
          Filter Repositories
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Organization</InputLabel>
              <Select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                label="Organization"
              >
                <MenuItem value="all">All Organizations</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org} value={org}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Business fontSize="small" />
                      {org}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Repository Type</InputLabel>
              <Select
                value={repoType}
                onChange={(e) => setRepoType(e.target.value)}
                label="Repository Type"
              >
                <MenuItem value="all">All Repositories</MenuItem>
                <MenuItem value="public">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PublicOutlined fontSize="small" />
                    Public
                  </Box>
                </MenuItem>
                <MenuItem value="private">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LockOutlined fontSize="small" />
                    Private
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={clearFilters} color="primary">
                <Clear />
              </IconButton>
              <Chip
                label={`${filteredRepositories.length} repos`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Repositories Grid */}
        <Grid item xs={12} md={selectedRepo ? 8 : 12}>
          {loading && repositories.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress size={40} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading repositories...
              </Typography>
            </Paper>
          ) : filteredRepositories.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Folder sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No repositories found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search terms
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredRepositories.map((repo) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={selectedRepo ? 6 : 4}
                  lg={selectedRepo ? 4 : 3}
                  key={repo.id}
                >
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      border: selectedRepo?.id === repo.id ? 2 : 1,
                      borderColor:
                        selectedRepo?.id === repo.id
                          ? "primary.main"
                          : "divider",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => fetchPullRequests(repo)}
                  >
                    <CardContent
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Folder color="primary" />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: "1rem",
                              fontWeight: "medium",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={repo.name}
                          >
                            {repo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {repo.owner.login}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {repo.private ? (
                            <LockOutlined fontSize="small" color="action" />
                          ) : (
                            <PublicOutlined fontSize="small" color="action" />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ flexGrow: 1, mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "2.5em", // Reserve space for 2 lines even if empty
                            lineHeight: 1.25,
                          }}
                        >
                          {repo.description || " "}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CalendarToday sx={{ fontSize: 14 }} />
                        <Typography variant="caption" color="text.secondary">
                          Updated {formatDate(repo.updated_at)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Pull Requests Panel */}
        {selectedRepo && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: "fit-content" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Code />
                Pull Requests
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedRepo.full_name}
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : pullRequests.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Code sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No open pull requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This repository has no open PRs to review
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {pullRequests.length} open pull request
                    {pullRequests.length !== 1 ? "s" : ""}
                  </Typography>

                  <List sx={{ maxHeight: "60vh", overflow: "auto" }}>
                    {pullRequests.map((pr) => (
                      <React.Fragment key={pr.id}>
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handlePRClick(pr)}
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              border: 1,
                              borderColor: "divider",
                              "&:hover": {
                                borderColor: "primary.main",
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ mb: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: "medium" }}
                                    >
                                      #{pr.number}
                                    </Typography>
                                    <Chip
                                      label={pr.state}
                                      size="small"
                                      color={
                                        pr.state === "open"
                                          ? "success"
                                          : "default"
                                      }
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {pr.title}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Avatar
                                    src={pr.user.avatar_url}
                                    sx={{ width: 16, height: 16 }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {pr.user.login}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    • {formatDate(pr.created_at)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
