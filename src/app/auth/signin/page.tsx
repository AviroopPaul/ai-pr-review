"use client";

import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { GitHub, ArrowBack } from "@mui/icons-material";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();

  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleGoBack = () => {
    router.push("/");
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
            <GitHub sx={{ fontSize: 32 }} />
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
            Welcome to KYPR
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: "1.125rem",
              lineHeight: 1.6,
              opacity: 0.8,
              mb: 2,
            }}
          >
            Sign in with your GitHub account to access AI-powered pull request
            reviews
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              opacity: 0.7,
              fontSize: "0.875rem",
              display: "block",
            }}
          >
            🔒 Secure OAuth authentication - we never store your GitHub
            credentials
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSignIn}
            startIcon={<GitHub />}
            sx={{
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
            }}
          >
            Continue with GitHub
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleGoBack}
            startIcon={<ArrowBack />}
            sx={{
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 500,
              borderRadius: 3,
              borderColor: "divider",
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
                borderColor: "text.secondary",
                transform: "translateY(-1px)",
              },
            }}
          >
            Back to Home
          </Button>
        </Box>

        <Box
          sx={{
            mt: 4,
            p: 3,
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
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Why GitHub OAuth?
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, "& li": { mb: 1 } }}>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Secure access
              </Typography>{" "}
              to your repositories without storing credentials
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Read-only permissions
              </Typography>{" "}
              - we can only read your code, never modify it
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6 }}>
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Revoke anytime
              </Typography>{" "}
              from your GitHub settings
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
