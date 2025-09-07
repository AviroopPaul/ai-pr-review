"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import ThemeProvider from "@/app/components/layout/ThemeProvider";
import Navbar from "@/app/components/layout/Navbar";
import { Box } from "@mui/material";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
            background: (theme) => `
              radial-gradient(circle, ${
                theme.palette.mode === "dark"
                  ? "rgba(0,255,0,0.3)"
                  : "rgba(0,150,0,0.2)"
              } 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
            animation: "matrixRain 8s linear infinite",
            "@keyframes matrixRain": {
              "0%": {
                backgroundPosition: "0 0, 10px 10px",
              },
              "100%": {
                backgroundPosition: "0 400px, 10px 410px",
              },
            },
          }}
        >
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </SessionProvider>
  );
}
