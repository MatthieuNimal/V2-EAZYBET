# Système de Paris EazyBet

## Vue d'ensemble

Le système de paris d'EazyBet permet aux joueurs de parier des **jetons** sur des matchs sportifs et de gagner à la fois des **jetons** et des **diamants** en cas de victoire.

## Logique des Gains

### Quand un joueur mise

Quand un joueur place un pari :
- Les jetons misés sont **immédiatement déduits** de son solde
- Le pari est enregistré dans la table `bets` avec :
  - Montant misé (`amount`)
  - Choix (A, Draw, ou B)
  - Cote (`odds`)
  - Gain potentiel total (`potential_win` = montant × cote)
  - Diamants potentiels (`potential_diamonds` = 1% du profit)

### Si le joueur GAGNE

Le joueur récupère :
1. **Ses jetons misés + le gain basé sur la cote**
   - Gain total = montant × cote
   - Exemple : 100 jetons × 2.5 = 250 jetons

2. **1% du profit en diamants**
   - Profit = Gain total - Mise initiale
   - Diamants = 1% du profit
   - Exemple : Profit = 250 - 100 = 150 jetons → 1.5 diamants (arrondi à 2)

**Exemple complet :**
```
Mise : 100 jetons
Cote : 2.5

Si victoire :
- Gain total en jetons : 250 jetons (récupération de la mise + profit)
- Profit : 150 jetons
- Bonus diamants : 2 diamants (1% de 150)

Résultat final :
- Jetons : +250
- Diamants : +2
- won_bets : +1
```

### Si le joueur PERD

Le joueur :
- Perd simplement les jetons misés (déjà déduits)
- Ne récupère rien
- Le pari est marqué avec `is_win = false`

## Base de Données

### Table `bets`

Colonnes principales :
- `user_id` : ID de l'utilisateur
- `match_id` : ID du match
- `amount` : Montant misé en jetons
- `choice` : Choix du pari ('A', 'Draw', 'B')
- `odds` : Cote au moment du pari
- `potential_win` : Gain total potentiel (montant × cote)
- `potential_diamonds` : Diamants potentiels (1% du profit)
- `is_win` : NULL (en attente), true (gagné), false (perdu)
- `tokens_won` : Jetons réellement gagnés (rempli après résolution)
- `diamonds_won` : Diamants réellement gagnés (rempli après résolution)

### Table `profiles`

Colonnes mises à jour :
- `tokens` : Solde de jetons
- `diamonds` : Solde de diamants
- `total_bets` : Nombre total de paris placés
- `won_bets` : Nombre de paris gagnés

## Processus de Résolution

### 1. Placement du pari (`lib/api-client.ts::placeBet`)

```typescript
// Calcul des gains potentiels
const totalWin = montant × cote
const profit = totalWin - montant
const diamandsFromProfit = profit × 0.01

// Déduction immédiate des jetons
profiles.tokens -= montant
profiles.total_bets += 1

// Enregistrement du pari
bets.insert({
  amount: montant,
  odds: cote,
  potential_win: totalWin,
  potential_diamonds: diamandsFromProfit,
  is_win: null // En attente
})
```

### 2. Résolution du match (`lib/bet-resolution.ts::resolveMatchBets`)

Quand un match se termine :

**Pour chaque pari sur ce match :**

Si victoire (`bet.choice === result`) :
```typescript
// Attribution des gains
profiles.tokens += bet.potential_win
profiles.diamonds += bet.potential_diamonds
profiles.won_bets += 1

// Mise à jour du pari
bets.update({
  is_win: true,
  tokens_won: bet.potential_win,
  diamonds_won: bet.potential_diamonds
})
```

Si défaite :
```typescript
// Aucun gain
bets.update({
  is_win: false,
  tokens_won: 0,
  diamonds_won: 0
})
```

## API Endpoints

### POST `/api/matches/resolve`

Résout un match et traite tous les paris associés.

**Corps de la requête :**
```json
{
  "matchId": "uuid-du-match",
  "result": "A" | "Draw" | "B"
}
```

Ou pour simuler un résultat aléatoire :
```json
{
  "matchId": "uuid-du-match",
  "simulate": true
}
```

**Réponse :**
```json
{
  "processed": 15,
  "message": "Successfully processed 15 bets"
}
```

## Interface Admin

Page `/admin` pour résoudre les matchs :
- Affiche tous les matchs en attente
- Boutons pour chaque résultat possible (A gagne, Match nul, B gagne)
- Bouton pour simuler un résultat aléatoire
- Historique des matchs terminés

## Classement

Le classement se base sur le **nombre total de diamants** :
- Seuls les diamants comptent pour le classement
- Les jetons servent uniquement à parier
- Les joueurs accumulent des diamants en gagnant des paris

## Sécurité

- Validation de la mise minimum (10 jetons)
- Vérification du solde avant le pari
- Rollback automatique en cas d'erreur
- Vérification que le match est bien en statut "upcoming"
- Les paris ne peuvent pas être modifiés après placement

## Flux Complet

```
1. Joueur place un pari
   ↓
2. Jetons déduits immédiatement
   ↓
3. Pari enregistré (is_win = null)
   ↓
4. Match se termine (admin ou système)
   ↓
5. Pour chaque pari :
   - Si gagné : jetons + diamants ajoutés
   - Si perdu : rien (jetons déjà perdus)
   ↓
6. Profil utilisateur mis à jour en temps réel
   ↓
7. Classement actualisé automatiquement
```

## Formules de Calcul

```javascript
// Placement du pari
totalWin = amount × odds
profit = totalWin - amount
diamandsFromProfit = Math.round(profit × 0.01)

// Si victoire
newTokens = currentTokens + totalWin
newDiamonds = currentDiamonds + diamandsFromProfit
newWonBets = wonBets + 1

// Si défaite
// Rien (jetons déjà déduits au placement)
```

## Notes Importantes

1. Les jetons sont **déduits immédiatement** lors du placement du pari
2. Les gains ne sont **distribués qu'après la résolution** du match
3. Le calcul des diamants se base sur le **profit** (gain - mise), pas sur le gain total
4. Tous les montants sont arrondis à l'entier le plus proche
5. Le système empêche les paris sur des matchs déjà commencés ou terminés
