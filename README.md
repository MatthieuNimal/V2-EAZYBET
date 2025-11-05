# EazyBet - Application de Paris Sportifs Fictifs

Application web PWA de paris sportifs avec système de jetons et tap-to-earn, construite avec Next.js 13.

## 🎯 Fonctionnalités V1

- **Interface sombre** inspirée de Winamax avec des cartes arrondies
- **4 sections principales** accessibles via une barre d'onglets en bas :
  - **Home** : Liste de matchs avec cotes (1/N/2) et 3 onglets internes (À venir, Joués, Résultats)
  - **Classement** : Tableau des meilleurs joueurs
  - **Mes paris** : Historique des paris placés
  - **Profil** : Statistiques utilisateur et réalisations
- **Tap-to-Earn** : Modal interactive pour gagner des jetons en cliquant
- **Système de monnaie fictive** : Jetons (💰) et diamants (💎)
- **State management** avec Zustand et persistance locale
- **Mock data** pour simulation sans backend

## 🚀 Installation et Lancement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Lancer l'application en développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build de production

```bash
npm run build
npm run start
```

## 🏗️ Structure du Projet

```
project/
├── app/
│   ├── page.tsx              # Page d'accueil avec matchs et onglets
│   ├── classement/page.tsx   # Page du classement
│   ├── mes-paris/page.tsx    # Page des paris
│   ├── profil/page.tsx       # Page du profil utilisateur
│   ├── layout.tsx            # Layout principal
│   └── globals.css           # Styles globaux
├── components/
│   ├── bottom-nav.tsx        # Barre de navigation en bas
│   ├── header.tsx            # En-tête avec jetons et diamants
│   ├── match-card.tsx        # Carte de match avec cotes
│   ├── tap-to-earn-modal.tsx # Modal tap-to-earn
│   └── ui/                   # Composants UI shadcn/ui
├── lib/
│   ├── store.ts              # Store Zustand (coins, diamonds)
│   ├── mock-data.ts          # Données de matchs fictifs
│   └── utils.ts              # Utilitaires
└── package.json
```

## 🛠️ Technologies Utilisées

- **Next.js 13** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **shadcn/ui** - Composants UI réutilisables
- **Zustand** - State management léger
- **Lucide React** - Icônes modernes

## 🎮 Utilisation

### Navigation
Utilisez la barre en bas pour naviguer entre les 4 sections principales.

### Gagner des jetons
1. Cliquez sur le bouton jaune "Cliquer pour gagner des jetons" en bas de l'écran d'accueil
2. Dans la modal, cliquez sur le jeton pour gagner des pièces
3. Chaque clic = +1 jeton
4. Les jetons sont sauvegardés localement

### Consulter les matchs
- **À venir** : Matchs futurs avec cotes pour parier
- **Joués** : Matchs en cours avec scores
- **Résultats** : Matchs terminés avec résultats finaux

## 📱 PWA & Mobile

Cette version V1 est une application web. Pour une version mobile native avec Expo/React Native, une structure monorepo sera créée dans la V2.

## 🔒 Sécurité

Toutes les données sont fictives et stockées localement. Aucune monnaie réelle n'est impliquée.

## 📝 Notes de Développement

- Les données de matchs sont mockées dans `lib/mock-data.ts`
- Le store utilise la persistance localStorage via Zustand
- Les composants sont typés avec TypeScript
- Design responsive adapté mobile et desktop
- Thème sombre par défaut

## 🚧 Futures Améliorations (V2)

- Backend réel avec Supabase
- Authentification utilisateur
- Paris réels avec gestion des jetons
- Notifications push
- Version mobile Expo/React Native
- Monorepo (apps/web, apps/mobile, packages/ui)

## 📄 Licence

Projet fictif à but éducatif - Pas de licence
