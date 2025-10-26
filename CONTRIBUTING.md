# Contributing to Musico

Thank you for your interest in contributing to Musico! 🎵 We welcome contributions from everyone. This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## 🤝 Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **Git** for version control

### Quick Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/musico.git
   cd musico
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/nishal21/musico.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

## 🛠️ Development Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MusicBrainz API Configuration
MUSICBRAINZ_USER_AGENT=Musico/1.0.0 (your-email@example.com)

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Optional: Development
NODE_ENV=development
```

### IDE Setup

We recommend using **Visual Studio Code** with these extensions:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto imports
- **Tailwind CSS IntelliSense** - CSS class suggestions
- **Auto Rename Tag** - HTML/JSX tag renaming

### VS Code Settings

Add these settings to your workspace `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["tv\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug Fixes** - Fix existing issues
- ✨ **Features** - Add new functionality
- 📚 **Documentation** - Improve docs or add examples
- 🎨 **UI/UX** - Improve design and user experience
- 🧪 **Tests** - Add or improve test coverage
- 🔧 **Tools** - Development tools and scripts
- 🌐 **Translations** - Add language support

### Finding Issues to Work On

1. **Check existing issues** on GitHub
2. **Look for "good first issue"** or "help wanted" labels
3. **Check the roadmap** in the README for planned features
4. **Ask in discussions** if you're unsure where to start

## 🔄 Development Workflow

### 1. Choose an Issue

- Find an issue you'd like to work on
- Comment on the issue to indicate you're working on it
- Wait for maintainer approval if it's a complex change

### 2. Create a Branch

Create a feature branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Write clear, focused commits
- Test your changes thoroughly
- Follow our code standards
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when available)
npm run test

# Build for production
npm run build
```

### 5. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines) below.

### 6. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## 📏 Code Standards

### TypeScript/JavaScript

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Consistent formatting
- **Imports**: Group by external, internal, relative
- **Naming**: camelCase for variables/functions, PascalCase for components

### React/Next.js

- **Components**: Functional components with hooks
- **Props**: Use TypeScript interfaces
- **State**: Prefer useState/useReducer over class state
- **Effects**: Clean up effects properly
- **Keys**: Always provide stable keys for lists

### CSS/Styling

- **Tailwind CSS**: Utility-first approach
- **Responsive**: Mobile-first design
- **Dark Mode**: Support both themes
- **Custom Classes**: Use meaningful names

### File Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # Reusable components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility functions
├── types/                # TypeScript definitions
└── utils/                # Helper functions
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API route and context tests
- **E2E Tests**: User flow tests (future)
- **Visual Tests**: Component appearance tests (future)

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/components/MusicCard.test.tsx
```

### Writing Tests

- Use **Jest** and **React Testing Library**
- Test user interactions, not implementation details
- Mock external dependencies (APIs, contexts)
- Aim for >80% code coverage

## 📝 Commit Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/) specification:

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat: add dark mode toggle
fix: resolve PWA install prompt on iOS
docs: update installation instructions
style: format code with Prettier
refactor: simplify music search logic
test: add unit tests for MusicCard component
chore: update dependencies
```

### Scope (Optional)

- **components**: Component-related changes
- **api**: API route changes
- **styles**: Styling changes
- **docs**: Documentation changes
- **config**: Configuration changes

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

3. **Update documentation** if needed

### PR Template

When creating a PR, please include:

- **Title**: Clear, descriptive title following commit conventions
- **Description**: What changes were made and why
- **Screenshots**: For UI changes
- **Testing**: How you tested the changes
- **Breaking Changes**: If any, with migration guide

### Review Process

1. **Automated Checks**: CI/CD pipeline runs
2. **Code Review**: At least one maintainer review
3. **Testing**: Manual testing if needed
4. **Approval**: PR approved and merged

### After Merge

- Delete your feature branch
- Pull latest changes to your local main branch

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment**: Browser, OS, device
- **Console errors** or logs

### Feature Requests

For new features, please include:

- **Clear description** of the feature
- **Use case** and why it's needed
- **Mockups** or examples if possible
- **Implementation ideas** if you have them

### Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation needed
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information needed

## 📄 License

By contributing to Musico, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

## 🙏 Recognition

Contributors will be recognized in our README and potentially featured in release notes. We appreciate all contributions, big and small!

## 📞 Getting Help

- **Discussions**: Use [GitHub Discussions](https://github.com/nishal21/musico/discussions) for questions
- **Issues**: Open an issue for bugs or feature requests
- **Discord**: Join our community (coming soon)

Thank you for contributing to Musico! 🎵✨