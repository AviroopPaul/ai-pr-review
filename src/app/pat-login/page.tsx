"use client";

import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { GitHub, VpnKey } from "@mui/icons-material";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";

export default function PatLogin() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken: setAuthToken, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!token.trim()) {
      setError("Please enter a Personal Access Token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Test the token by fetching user info
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Invalid token: ${response.status}`);
      }

      const user = await response.json();

      // Store the token and user info
      setAuthToken(token);
      setUser(user);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Box
        sx={{
          backgroundColor: "background.paper",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 3, md: 5 },
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 10px 40px rgba(0,0,0,0.3)"
              : "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
            }}
          >
            <VpnKey sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.75rem", md: "2.125rem" },
              color: "text.primary",
              letterSpacing: "-0.02em",
              mb: 2,
            }}
          >
            Personal Access Token
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: "1.125rem",
              lineHeight: 1.6,
              opacity: 0.8,
            }}
          >
            Enter your GitHub Personal Access Token to access your repositories
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 2,
              opacity: 0.7,
              fontSize: "0.875rem",
              display: "block",
            }}
          >
            🔒 Your token is stored locally and never sent to our servers
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            type="password"
            label="Personal Access Token"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            helperText="Your token needs 'repo' and 'read:org' scopes"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontSize: "1rem",
                backgroundColor: "background.default",
                "& fieldset": {
                  borderColor: "divider",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                fontWeight: 500,
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading || !token.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <GitHub />}
          sx={{
            mb: 4,
            py: 2,
            fontSize: "1rem",
            fontWeight: 600,
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
            "&:disabled": {
              background: "grey.300",
              transform: "none",
              boxShadow: "none",
            },
          }}
        >
          {loading ? "Validating..." : "Login with Token"}
        </Button>

        <Box
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 3,
            }}
          >
            How to create a Personal Access Token:
          </Typography>
          <Box component="ol" sx={{ ml: 2, "& li": { mb: 1.5 } }}>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              Go to{" "}
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                GitHub Settings → Developer settings → Personal access tokens
              </Typography>
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              Click{" "}
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                "Generate new token (classic)"
              </Typography>
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              Select these scopes:
            </Typography>
            <Box component="ul" sx={{ mt: 1, ml: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  repo
                </Typography>{" "}
                - Full control of private repositories
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  read:org
                </Typography>{" "}
                - Read org and team membership
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  read:user
                </Typography>{" "}
                - Read user profile data
              </Typography>
            </Box>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              Copy the generated token and paste it above
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
