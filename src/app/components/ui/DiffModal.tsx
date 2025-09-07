"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import ReactDiffViewer from "react-diff-viewer";
import Chat from "@/app/components/ui/Chat";
import { useUIStore } from "@/app/store/uiStore";

interface DiffModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  fileDiff: string;
}

export default function DiffModal({
  open,
  onClose,
  fileName,
  fileDiff,
}: DiffModalProps) {
  const { themeMode } = useUIStore();

  // Parse the diff to extract old and new content
  const parseDiff = (diff: string) => {
    const lines = diff.split("\n");
    let oldContent = "";
    let newContent = "";

    for (const line of lines) {
      if (line.startsWith("@@")) {
        // Skip hunk headers
        continue;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        // Removed line
        oldContent += line.substring(1) + "\n";
      } else if (line.startsWith("+") && !line.startsWith("+++")) {
        // Added line
        newContent += line.substring(1) + "\n";
      } else if (
        !line.startsWith("diff") &&
        !line.startsWith("index") &&
        !line.startsWith("---") &&
        !line.startsWith("+++")
      ) {
        // Context line (unchanged)
        oldContent += line + "\n";
        newContent += line + "\n";
      }
    }

    return { oldContent: oldContent.trim(), newContent: newContent.trim() };
  };

  const { oldContent, newContent } = parseDiff(fileDiff);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: "95vw",
          height: "90vh",
          maxWidth: "none",
          maxHeight: "none",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Typography variant="h6" component="div">
          📄 {fileName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, height: "calc(90vh - 64px)", overflow: "hidden" }}
      >
        <Grid container sx={{ height: "100%" }}>
          {/* Diff Viewer - Left Side */}
          <Grid item xs={12} md={8} sx={{ height: "100%" }}>
            <Paper
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 0,
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  height: 0, // This forces the flex child to be scrollable
                  "& .diff-viewer": {
                    fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                    fontSize: "12px",
                  },
                }}
              >
                {fileDiff ? (
                  <ReactDiffViewer
                    oldValue={oldContent}
                    newValue={newContent}
                    splitView={true}
                    useDarkTheme={themeMode === "dark"}
                    showDiffOnly={false}
                    leftTitle="Original"
                    rightTitle="Modified"
                    styles={{
                      diffContainer: {
                        minHeight: "100%",
                      },
                      contentText: {
                        fontSize: "12px",
                        fontFamily:
                          "Monaco, Consolas, 'Courier New', monospace",
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "text.secondary",
                    }}
                  >
                    <Typography>No diff available</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* AI Chat - Right Side */}
          <Grid item xs={12} md={4} sx={{ height: "100%" }}>
            <Box
              sx={{
                height: "100%",
                borderLeft: 1,
                borderColor: "divider",
              }}
            >
              <Chat codeDiff={fileDiff} fileName={fileName} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
