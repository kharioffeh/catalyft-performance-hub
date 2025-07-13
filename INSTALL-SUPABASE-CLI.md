# Supabase CLI Installation Guide

## ✅ Fixed Installation Issue

The original installation error was caused by the direct pipe to `tar` failing due to network/format issues. Here's the correct installation method:

## Installation Steps

### 1. Download and Extract to Temporary Location
```bash
curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz -C /tmp
```

### 2. Install to Local Bin Directory
```bash
mkdir -p ~/.local/bin && cp /tmp/supabase ~/.local/bin/supabase && chmod +x ~/.local/bin/supabase
```

### 3. Add to PATH (Permanent)
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### 4. Source the Configuration or Start New Shell
```bash
source ~/.bashrc
# OR just start a new shell session
```

## Verification

Check if Supabase CLI is installed correctly:
```bash
supabase --version
```

You should see output like:
```
2.30.4
```

## Common Commands

- `supabase status` - Check project status (requires Docker for local development)
- `supabase login` - Authenticate with Supabase
- `supabase link` - Link to a Supabase project
- `supabase functions list` - List Edge Functions
- `supabase functions deploy` - Deploy Edge Functions

## Troubleshooting

### Error: "command not found"
- Make sure `~/.local/bin` is in your PATH
- Restart your terminal or run `source ~/.bashrc`

### Error: "Cannot connect to Docker daemon"
- This is expected if Docker is not running
- For remote projects, use `supabase login` and `supabase link` instead

### Download Issues
- Check your internet connection
- Try downloading manually and extracting step by step
- Use the two-step installation method shown above

## Alternative Installation Methods

### Using Package Manager (if available)
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install supabase

# macOS
brew install supabase/tap/supabase
```

### Manual Download
1. Go to https://github.com/supabase/cli/releases/latest
2. Download the appropriate binary for your system
3. Extract and move to `~/.local/bin/`
4. Make executable with `chmod +x`

## Next Steps

Once installed, you can:
1. Login to Supabase: `supabase login`
2. Link your project: `supabase link --project-ref xeugyryfvilanoiethum`
3. Deploy functions: `supabase functions deploy aria-generate-insights`
4. Check function logs: `supabase functions logs aria-generate-insights`