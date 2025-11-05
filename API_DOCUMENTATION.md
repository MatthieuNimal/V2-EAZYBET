# EazyBet Backend API Documentation

## Base URL
All API endpoints are available at: `https://your-domain.com/api`

## Authentication
Most endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "player1"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "token"
  }
}
```

#### POST /api/auth/login
Login to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player1",
    "tokens": 1000,
    "diamonds": 0
  },
  "session": {
    "access_token": "token",
    "refresh_token": "token"
  },
  "access_token": "token"
}
```

#### POST /api/auth/logout
Logout from current session.

**Headers:** Authorization required

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### User Profile

#### GET /api/user/profile
Get current user's profile.

**Headers:** Authorization required

**Response (200):**
```json
{
  "profile": {
    "id": "uuid",
    "username": "player1",
    "avatar_url": "https://...",
    "tokens": 1000,
    "diamonds": 50,
    "total_bets": 10,
    "won_bets": 6,
    "win_rate": 60,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PATCH /api/user/profile
Update user profile.

**Headers:** Authorization required

**Request Body:**
```json
{
  "username": "newusername",
  "avatar_url": "https://..."
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

---

### Tap-to-Earn

#### POST /api/user/tap-earn
Earn tokens by tapping.

**Headers:** Authorization required

**Request Body:**
```json
{
  "taps": 1
}
```

**Response (200):**
```json
{
  "message": "Tokens earned!",
  "tokens_earned": 10,
  "new_balance": 1010,
  "taps_used": 1,
  "remaining_taps": 99
}
```

#### GET /api/user/tap-earn
Get tap statistics for today.

**Headers:** Authorization required

**Response (200):**
```json
{
  "taps_used": 10,
  "taps_remaining": 90,
  "max_taps": 100,
  "tokens_per_tap": 10,
  "total_tokens_earned_today": 100
}
```

---

### Matches

#### GET /api/matches
Get list of matches.

**Query Parameters:**
- `status` (optional): upcoming, live, finished
- `league` (optional): filter by league

**Response (200):**
```json
{
  "matches": [
    {
      "id": "uuid",
      "team_a": "Team A",
      "team_b": "Team B",
      "league": "Premier League",
      "odds_a": 2.5,
      "odds_draw": 3.2,
      "odds_b": 2.8,
      "status": "upcoming",
      "result": null,
      "match_date": "2025-01-15T20:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/matches
Create a new match (admin only).

**Request Body:**
```json
{
  "team_a": "Team A",
  "team_b": "Team B",
  "league": "Premier League",
  "odds_a": 2.5,
  "odds_draw": 3.2,
  "odds_b": 2.8,
  "match_date": "2025-01-15T20:00:00Z"
}
```

---

### Bets

#### POST /api/bets/place
Place a bet on a match.

**Headers:** Authorization required

**Request Body:**
```json
{
  "match_id": "uuid",
  "amount": 100,
  "choice": "A"
}
```

**Response (201):**
```json
{
  "message": "Bet placed successfully!",
  "bet": {
    "id": "uuid",
    "match_id": "uuid",
    "amount": 100,
    "choice": "A",
    "odds": 2.5,
    "potential_diamonds": 25,
    "created_at": "2025-01-15T18:00:00Z"
  },
  "new_token_balance": 900
}
```

#### GET /api/bets/place
Get user's bets.

**Headers:** Authorization required

**Query Parameters:**
- `status` (optional): active, history

**Response (200):**
```json
{
  "bets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "match_id": "uuid",
      "amount": 100,
      "choice": "A",
      "odds": 2.5,
      "potential_diamonds": 25,
      "is_win": null,
      "diamonds_won": 0,
      "created_at": "2025-01-15T18:00:00Z",
      "matches": {
        "id": "uuid",
        "team_a": "Team A",
        "team_b": "Team B",
        "league": "Premier League",
        "status": "upcoming",
        "result": null,
        "match_date": "2025-01-15T20:00:00Z"
      }
    }
  ]
}
```

---

### Bet Results

#### POST /api/bets/results
Process match result and award diamonds (admin only).

**Request Body:**
```json
{
  "match_id": "uuid",
  "result": "A"
}
```

**Response (200):**
```json
{
  "message": "Match result processed successfully",
  "match_id": "uuid",
  "result": "A",
  "winners": 5,
  "losers": 3,
  "total_bets": 8
}
```

#### GET /api/bets/results
Get result for a specific match.

**Query Parameters:**
- `match_id`: Match UUID

**Response (200):**
```json
{
  "match": {
    "id": "uuid",
    "team_a": "Team A",
    "team_b": "Team B",
    "status": "finished",
    "result": "A"
  }
}
```

---

### Leaderboard

#### GET /api/leaderboard
Get top players ranked by diamonds.

**Query Parameters:**
- `limit` (optional, default: 100): Number of players
- `offset` (optional, default: 0): Pagination offset

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "id": "uuid",
      "username": "player1",
      "avatar_url": "https://...",
      "diamonds": 500,
      "total_bets": 50,
      "won_bets": 35,
      "win_rate": 70
    }
  ],
  "total": 100,
  "offset": 0,
  "limit": 100
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 404: Not Found
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

---

## Database Schema

### Tables

#### profiles
- id (uuid, primary key)
- username (text, unique)
- avatar_url (text, nullable)
- tokens (integer, default 1000)
- diamonds (integer, default 0)
- total_bets (integer, default 0)
- won_bets (integer, default 0)
- created_at (timestamptz)
- updated_at (timestamptz)

#### matches
- id (uuid, primary key)
- team_a (text)
- team_b (text)
- league (text)
- odds_a (decimal)
- odds_draw (decimal)
- odds_b (decimal)
- status (text: upcoming, live, finished)
- result (text: A, Draw, B, nullable)
- match_date (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)

#### bets
- id (uuid, primary key)
- user_id (uuid, foreign key)
- match_id (uuid, foreign key)
- amount (integer)
- choice (text: A, Draw, B)
- odds (decimal)
- potential_diamonds (integer)
- is_win (boolean, nullable)
- diamonds_won (integer, default 0)
- created_at (timestamptz)

#### tap_earnings
- id (uuid, primary key)
- user_id (uuid, foreign key)
- tokens_earned (integer)
- created_at (timestamptz)

---

## Security Features

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase Auth
- Users can only access their own data
- Secure password hashing
- Session management with automatic token refresh
- Rate limiting on tap-to-earn (100 taps/day)
- Validation on all inputs
- Prevention of betting on started/finished matches
- Automatic token deduction and diamond awarding
