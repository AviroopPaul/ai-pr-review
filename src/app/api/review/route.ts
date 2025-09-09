import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (either OAuth or PAT)
    const session = await getServerSession(authOptions);

    // Check for PAT token in headers if no OAuth session
    const authHeader = request.headers.get("authorization");
    const patToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!session && !patToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { codeDiff, userQuestion, fileName, conversationHistory } = body;

    if (!codeDiff || !userQuestion) {
      return NextResponse.json(
        { error: "Missing required fields: codeDiff and userQuestion" },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    // Construct the prompt for the AI
    const systemPrompt = `You are an expert code reviewer for a senior software engineering team. Your feedback is always constructive, clear, and concise.

You have access to the conversation history, so you can reference previous questions, answers, and discussions. Use this context to provide more relevant and connected responses.

IMPORTANT: Keep your responses SHORT and CRISP. Be direct and to the point. Always provide specific code examples from the diff showing what to improve, not just general advice.

Analyze the following code diff and answer the user's question. Focus on actionable improvements with concrete examples from the actual code.

Focus on:
- Code quality and best practices
- Potential bugs or issues
- Performance implications
- Security considerations
- Maintainability and readability
- Testing recommendations

Be specific and actionable in your feedback. When referencing previous parts of the conversation, be clear about what you're referring to.`;

    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history if provided (limit to last 10 messages to prevent token overflow)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Convert ChatMessage format to Groq format and limit to last 10 messages
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current user question with code diff context
    const userPrompt = `CODE DIFF:
\`\`\`diff
${codeDiff}
\`\`\`

FILE: ${fileName || "Unknown file"}

USER QUESTION:
${userQuestion}

Please provide a detailed analysis and answer to the user's question.`;

    messages.push({
      role: "user",
      content: userPrompt,
    });

    // Make request to Groq API with streaming
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 2000,
          temperature: 0.7,
          stream: true, // Enable streaming
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    // Create a readable stream to forward the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error("No response body"));
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Forward the chunk to the client
            controller.enqueue(value);
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    // Return streaming response
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in AI review API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
