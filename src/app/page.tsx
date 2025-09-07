"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Link,
} from "@mui/material";
import {
  Code,
  Security,
  Speed,
  GitHub,
  ArrowForward,
  Favorite,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";

export default function Home() {
  const { data: session, status } = useSession();
  const { isAuthenticated: patAuth } = useAuthStore();
  const router = useRouter();

  const isAuthenticated = status === "authenticated" || patAuth;

  const features = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: "AI-Powered Analysis",
      description:
        "Get intelligent code reviews powered by GPT-4o to catch bugs, suggest improvements, and ensure code quality.",
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Secure GitHub Integration",
      description:
        "Securely connect to your GitHub repositories with OAuth authentication. Your code never leaves your control.",
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "Real-time Reviews",
      description:
        "Get instant feedback on your pull requests with side-by-side diff viewing and interactive chat interface.",
    },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      // This will trigger the login flow
      window.location.href = "/api/auth/signin";
    }
  };

  const handlePATLogin = () => {
    router.push("/pat-login");
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            color: "text.primary",
            mb: 2,
            letterSpacing: "-0.02em",
          }}
        >
          Know-Your-PR
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          color="text.secondary"
          gutterBottom
          sx={{
            mb: 3,
            fontWeight: 400,
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            lineHeight: 1.4,
          }}
        >
          AI-Powered Pull Request Reviewer
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 5,
            maxWidth: "650px",
            mx: "auto",
            fontSize: "1.125rem",
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          Transform your code review process with intelligent AI analysis. Get
          instant feedback, catch bugs early, and improve code quality with
          every pull request.
        </Typography>

        {isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleGetStarted}
            sx={{
              px: 5,
              py: 1.75,
              fontSize: "1rem",
              borderRadius: 3,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 20px rgba(25, 118, 210, 0.4)"
                  : "0 4px 20px rgba(25, 118, 210, 0.25)",
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 30px rgba(25, 118, 210, 0.6)"
                    : "0 8px 30px rgba(25, 118, 210, 0.35)",
              },
            }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<GitHub />}
              endIcon={<ArrowForward />}
              onClick={handleGetStarted}
              sx={{
                px: 5,
                py: 1.75,
                fontSize: "1rem",
                borderRadius: 3,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 4px 20px rgba(25, 118, 210, 0.4)"
                    : "0 4px 20px rgba(25, 118, 210, 0.25)",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 8px 30px rgba(25, 118, 210, 0.6)"
                      : "0 8px 30px rgba(25, 118, 210, 0.35)",
                },
              }}
            >
              Get Started with GitHub
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  opacity: 0.6,
                }}
              >
                or
              </Typography>

              <Button
                variant="outlined"
                size="large"
                onClick={handlePATLogin}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: "1rem",
                  borderRadius: 3,
                  borderColor: "primary.main",
                  color: "primary.main",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 8px 30px rgba(25, 118, 210, 0.6)"
                        : "0 8px 30px rgba(25, 118, 210, 0.35)",
                  },
                }}
              >
                Use Personal Access Token
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 1,
                  opacity: 0.7,
                  fontSize: "0.75rem",
                  display: "block",
                }}
              >
                🔒 Stored locally for security
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{
            mb: 8,
            fontWeight: 500,
            fontSize: { xs: "2rem", md: "2.5rem" },
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Why Choose KnowYourPR?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  backgroundColor: "background.paper",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 20px 40px rgba(0,0,0,0.3)"
                        : "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "primary.light",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
                  <Box sx={{ color: "primary.main", mb: 3, opacity: 0.8 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "text.primary",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      opacity: 0.8,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How it Works Section */}
      <Box sx={{ mb: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{
            mb: 8,
            fontWeight: 500,
            fontSize: { xs: "2rem", md: "2.5rem" },
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          How It Works
        </Typography>

        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
                }}
              >
                1
              </Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Connect GitHub
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  opacity: 0.8,
                }}
              >
                Securely authenticate with your GitHub account using OAuth
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
                }}
              >
                2
              </Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Select Repository
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  opacity: 0.8,
                }}
              >
                Choose from your repositories and view open pull requests
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
                }}
              >
                3
              </Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                Get AI Review
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  opacity: 0.8,
                }}
              >
                Chat with AI to analyze code changes and get intelligent
                feedback
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            opacity: 0.7,
          }}
        >
          Built By{" "}
          <Link
            href="https://github.com/avirooppaul"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Aviroop
          </Link>
          <Favorite sx={{ fontSize: 16, color: "error.main", mx: 0.5 }} />
        </Typography>
      </Box>
    </Container>
  );
}
