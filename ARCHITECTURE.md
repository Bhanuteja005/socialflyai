# SocialFly AI - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SocialFly AI Platform                            │
│                    http://localhost:3000                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐            ┌────────▼─────────┐
            │   Frontend UI   │            │   API Routes     │
            │   (React)       │            │   (Next.js)      │
            │                 │            │                  │
            │  - Tab UI       │◄──────────►│  - 14 Endpoints  │
            │  - Forms        │   fetch()  │  - TypeScript    │
            │  - File Upload  │            │  - Error Handling│
            │  - OAuth Flow   │            │                  │
            └─────────────────┘            └────────┬─────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
            ┌───────▼────────┐            ┌────────▼─────────┐          ┌──────────▼────────┐
            │    Discord     │            │    Facebook      │          │     LinkedIn      │
            │                │            │                  │          │                   │
            │  - Bot Token   │            │  - Page Token    │          │  - Access Token   │
            │  - Send Msg    │            │  - Post Feed     │          │  - Text Post      │
            │  - Send Media  │            │  - Upload Media  │          │  - Image Post     │
            │                │            │  - Get Posts     │          │  - Get Profile    │
            └────────────────┘            └──────────────────┘          └───────────────────┘
                    
                    │                               │                               │
            ┌───────▼────────┐            ┌────────▼─────────┐
            │   X (Twitter)  │            │     YouTube      │
            │                │            │                  │
            │  - OAuth 2.0   │            │  - OAuth 2.0     │
            │  - PKCE Flow   │            │  - Google Auth   │
            │  - Post Tweet  │            │  - Upload Video  │
            │                │            │                  │
            └────────────────┘            └──────────────────┘
```

## Data Flow Diagram

### Example: Discord Message Flow

```
┌─────────┐     1. User Input      ┌──────────────┐
│  User   │ ─────────────────────► │   UI Form    │
│ (Browser)│                        │ (page.tsx)   │
└─────────┘                         └──────┬───────┘
                                          │
                                   2. Form Submit
                                          │
                                    ┌─────▼────────────┐
                                    │  fetch() API     │
                                    │  POST Request    │
                                    └─────┬────────────┘
                                          │
                         3. API Route     │
                           Handler        │
                                    ┌─────▼─────────────────┐
                                    │ /api/discord/         │
                                    │  send-message         │
                                    │  - Validate input     │
                                    │  - Prepare request    │
                                    └─────┬─────────────────┘
                                          │
                            4. External   │
                               API Call   │
                                    ┌─────▼─────────────────┐
                                    │  Discord API          │
                                    │  POST /channels/      │
                                    │  {channelId}/messages │
                                    │  - Bot Token Auth     │
                                    └─────┬─────────────────┘
                                          │
                              5. Response │
                                          │
                                    ┌─────▼─────────────────┐
                                    │  Process Response     │
                                    │  - Success/Error      │
                                    │  - Format JSON        │
                                    └─────┬─────────────────┘
                                          │
                           6. Return      │
                              to Client   │
                                    ┌─────▼─────────────────┐
                                    │  UI Update            │
                                    │  - Show response      │
                                    │  - Display error      │
                                    └───────────────────────┘
```

## OAuth 2.0 Flow (X and YouTube)

```
┌─────────┐     1. Click "Get Auth URL"     ┌──────────────┐
│  User   │ ──────────────────────────────► │   Frontend   │
└─────────┘                                  └──────┬───────┘
                                                    │
                                    2. GET /api/x/auth-url
                                                    │
                                             ┌──────▼───────┐
                                             │  Generate    │
                                             │  - Verifier  │
                                             │  - Challenge │
                                             │  - State     │
                                             └──────┬───────┘
                                                    │
                                3. Return Auth URL  │
┌─────────┐                                  ┌──────▼───────┐
│  User   │ ◄──────────────────────────────  │   Frontend   │
└────┬────┘     Display clickable link       └──────────────┘
     │
     │ 4. Click link, browser redirects
     │
┌────▼──────────┐
│   Platform    │  5. User authorizes app
│  (X/YouTube)  │
└────┬──────────┘
     │
     │ 6. Redirect with code
     │
┌────▼────┐                                  ┌──────────────┐
│  User   │ ─── 7. Paste code ────────────► │   Frontend   │
└─────────┘                                  └──────┬───────┘
                                                    │
                              8. POST /api/x/callback
                                 { code, verifier }
                                                    │
                                             ┌──────▼───────┐
                                             │  Exchange    │
                                             │  Code for    │
                                             │  Token       │
                                             └──────┬───────┘
                                                    │
                                 9. Return tokens   │
┌─────────┐                                  ┌──────▼───────┐
│  User   │ ◄──────────────────────────────  │   Frontend   │
└─────────┘     Store access token          └──────────────┘
                                                    
     │
     │ 10. Use token for API calls
     │
     ▼
```

## File Upload Flow (Discord/Facebook/YouTube)

```
┌─────────┐     1. Select File        ┌──────────────┐
│  User   │ ─────────────────────────►│   File Input │
└─────────┘                            │   <input/>   │
                                       └──────┬───────┘
                                              │
                                2. File object│
                                              │
                                       ┌──────▼───────┐
                                       │  FormData    │
                                       │  .append()   │
                                       └──────┬───────┘
                                              │
                         3. POST with         │
                            multipart/form-data
                                              │
                                       ┌──────▼────────────┐
                                       │  API Route        │
                                       │  - await          │
                                       │    request        │
                                       │    .formData()    │
                                       └──────┬────────────┘
                                              │
                                4. Extract    │
                                   file       │
                                              │
                                       ┌──────▼────────────┐
                                       │  Convert to       │
                                       │  - Buffer         │
                                       │  - Stream         │
                                       │  - FormData       │
                                       └──────┬────────────┘
                                              │
                               5. Upload to   │
                                  platform    │
                                              │
                                       ┌──────▼────────────┐
                                       │  Platform API     │
                                       │  - Discord        │
                                       │  - Facebook       │
                                       │  - YouTube        │
                                       └──────┬────────────┘
                                              │
                                6. Response   │
                                              │
                                       ┌──────▼────────────┐
                                       │  Return to UI     │
                                       │  - Success msg    │
                                       │  - Media ID       │
                                       └───────────────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  React • TypeScript • Tailwind CSS                      │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  Next.js App Router • API Routes                        │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   Integration Layer                      │
│  Axios • googleapis • form-data                         │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  External APIs                           │
│  Discord • Facebook • LinkedIn • X • YouTube            │
└─────────────────────────────────────────────────────────┘
```

## Testing Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Testing Layer                          │
└──────────────────────────────────────────────────────────┘
           │                              │
    ┌──────▼──────┐              ┌───────▼────────┐
    │  Web UI     │              │  Test Scripts   │
    │  Testing    │              │                 │
    │             │              │  - PowerShell   │
    │  - Manual   │              │  - Node.js      │
    │  - Visual   │              │  - Automated    │
    │  - Real-time│              │  - CI/CD ready  │
    └─────────────┘              └─────────────────┘
```

## Environment Configuration Flow

```
┌──────────────┐
│ .env.local   │  ← User creates & fills
└──────┬───────┘
       │
       │ Read at runtime
       │
┌──────▼────────────────────────────────┐
│  process.env.PLATFORM_CREDENTIAL      │
└──────┬────────────────────────────────┘
       │
       │ Used in API routes
       │
┌──────▼────────────────────────────────┐
│  API Route Handler                    │
│  - Access via process.env             │
│  - Never exposed to client            │
└───────────────────────────────────────┘
```

## Security Model

```
┌──────────────┐       Public Access       ┌─────────────┐
│   Browser    │ ◄────────────────────────►│  Frontend   │
│              │      (Public Routes)       │   (Client)  │
└──────────────┘                            └─────────────┘
                                                   │
                                                   │ HTTP Request
                                                   │
                                            ┌──────▼──────┐
                                            │  API Routes │
                                            │  (Server)   │
                                            └──────┬──────┘
                                                   │
                                  Server-side only │
                                  Access to secrets│
                                                   │
                                            ┌──────▼──────┐
                                            │ .env.local  │
                                            │ Credentials │
                                            └─────────────┘
```

## Request/Response Pattern

```
Client                    API Route                Platform
   │                         │                         │
   │  1. POST /api/...      │                         │
   ├────────────────────────►                         │
   │                         │                         │
   │                         │  2. Validate input      │
   │                         │                         │
   │                         │  3. Prepare request     │
   │                         │                         │
   │                         │  4. External API call   │
   │                         ├────────────────────────►│
   │                         │                         │
   │                         │  5. Platform response   │
   │                         ◄────────────────────────┤
   │                         │                         │
   │                         │  6. Process response    │
   │                         │                         │
   │  7. JSON response       │                         │
   ◄────────────────────────┤                         │
   │                         │                         │
   │  8. Update UI           │                         │
   │                         │                         │
```

---

**Legend:**
- `┌─┐` Boxes represent components/layers
- `│` Vertical lines show data flow
- `◄─►` Bidirectional communication
- `─►` Unidirectional flow
- Numbers indicate sequence of operations
