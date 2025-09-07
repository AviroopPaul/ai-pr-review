"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import { Brightness4, Brightness7, Login, Logout } from "@mui/icons-material";
import { useUIStore } from "@/app/store/uiStore";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { themeMode, toggleTheme } = useUIStore();
  const { data: session, status } = useSession();
  const { isAuthenticated: patAuth, user: patUser, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleSignIn = () => {
    signIn("github");
  };

  const handleSignOut = () => {
    if (patAuth) {
      clearAuth();
      router.push("/");
    } else {
      signOut();
    }
  };

  const isAuthenticated = status === "authenticated" || patAuth;
  const user = session?.user || patUser;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "transparent",
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Typography
          variant="h6"
          component="div"
          onClick={() => {
            if (!isAuthenticated) {
              router.push("/");
            }
          }}
          sx={{
            flexGrow: 1,
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: "1.25rem",
            color: "text.primary",
            letterSpacing: "-0.01em",
            cursor: !isAuthenticated ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover": !isAuthenticated
              ? {
                  opacity: 0.8,
                }
              : {},
          }}
        >
          KYPR
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {status === "loading" && !patAuth ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                opacity: 0.8,
              }}
            >
              Loading...
            </Typography>
          ) : isAuthenticated ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Welcome, {user?.name || user?.login}
                {patAuth && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.25,
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    PAT
                  </Box>
                )}
              </Typography>
              <Button
                startIcon={<Logout />}
                onClick={handleSignOut}
                size="small"
                sx={{
                  color: "text.primary",
                  borderRadius: 2,
                  px: 2,
                  py: 0.75,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : null}

          <IconButton
            onClick={toggleTheme}
            sx={{
              ml: 1,
              color: "text.primary",
              borderRadius: 2,
              width: 40,
              height: 40,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
                transform: "translateY(-1px)",
              },
            }}
          >
            {themeMode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
