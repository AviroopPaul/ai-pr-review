# KnowYourPR - AI-Powered Pull Request Reviewer

A modern web application that provides intelligent code review assistance using AI. Built with Next.js, Material-UI, and OpenAI GPT-4o via OpenRouter.

## Features

- 🔐 **Secure GitHub Integration**: OAuth authentication with GitHub
- 🤖 **AI-Powered Code Review**: Get intelligent feedback using GPT-4o
- 📊 **Interactive Diff Viewer**: Side-by-side code comparison
- 💬 **Real-time Chat**: Ask questions about your code changes
- 🌙 **Dark/Light Mode**: Beautiful theming with Material-UI
- 📱 **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI)
- **Styling**: styled-components
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **GitHub API**: Octokit
- **AI Model**: OpenAI GPT-4o (via OpenRouter)
- **Diff Viewing**: react-diff-viewer

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (version 18 or higher)
2. **Git** installed
3. **GitHub Account** for OAuth setup
4. **OpenRouter API Key** for AI functionality

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd KnowYourPR
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# GitHub OAuth Configuration
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: KnowYourPR
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** to your `.env.local` file

### 5. OpenRouter API Setup

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Generate an API key
4. Add the API key to your `.env.local` file

### 6. NextAuth Secret

Generate a random secret for NextAuth:

```bash
openssl rand -base64 32
```

Add this to your `.env.local` file as `NEXTAUTH_SECRET`.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Login**: Click "Login with GitHub" to authenticate
2. **Select Repository**: Choose from your GitHub repositories
3. **View Pull Requests**: Browse open pull requests
4. **Review Code**: Click on a PR to view files and diffs
5. **AI Chat**: Ask questions about the code changes in the chat panel

## Project Structure

```
src/app/
├── api/                    # API routes
│   ├── auth/              # NextAuth configuration
│   └── review/            # AI review endpoint
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Core logic and API clients
├── store/                 # Zustand stores
├── styles/                # Theme configuration
└── types/                 # TypeScript type definitions
```

## Key Features Explained

### Authentication Flow

- Secure OAuth with GitHub
- Session management with NextAuth
- Access token stored securely for API calls

### GitHub Integration

- Fetch user repositories
- List pull requests
- Get file diffs
- All operations use authenticated GitHub API

### AI Code Review

- Secure server-side API calls to OpenRouter
- GPT-4o powered analysis
- Context-aware responses about code changes
- Real-time chat interface

### UI/UX

- Material-UI components
- Dark/light theme support
- Responsive design
- Loading states and error handling

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Update your GitHub OAuth app with production URLs:

- **Homepage URL**: `https://your-domain.vercel.app`
- **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Ensure your GitHub OAuth app is configured correctly
4. Check that your OpenRouter API key is valid

## Roadmap

- [ ] Support for private repositories
- [ ] Batch file analysis
- [ ] Code quality metrics
- [ ] Integration with CI/CD pipelines
- [ ] Custom AI prompts
- [ ] Team collaboration features
# ai-pr-review
