# 🗳️ EasyVote
*Plateforme web moderne de vote universitaire sécurisé*

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3.3.5](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)
![React 18](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-blue.svg)
![License MIT](https://img.shields.io/badge/License-MIT-green.svg)

EasyVote est une plateforme hybride dédiée à la gestion des élections universitaires, permettant un vote cryptographiquement sécurisé et anonyme. Elle intègre des profils candidats interactifs, un chatbot intelligent et un suivi en temps réel des résultats.

![HomePage](docs/homepage.png)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Démarrage rapide](#-démarrage-rapide)
- [Architecture](#-architecture)
- [Structure du projet](#-structure-du-projet)
- [Comptes de test](#-comptes-de-test)
- [Endpoints API](#-endpoints-api)
- [Captures d'écran](#-captures-décran)
- [Roadmap](#-roadmap)
- [Auteur](#-auteur)
- [Licence](#-licence)
- [Remerciements](#-remerciements)

## 💡 À propos

Projet réalisé dans le cadre du module de génie logiciel (sprint d'un jour, organisé en 3 modules principaux). L'application se distingue techniquement par son **anonymat cryptographique (SHA-256)** qui sépare l'identité de l'électeur de son bulletin de vote, garantissant ainsi l'intégrité et la confidentialité totale du scrutin.

## ✨ Fonctionnalités

- 🗳️ **Vote sécurisé et anonyme (SHA-256)** : Jetons de vote hashés garantissant l'anonymat.
- 🎯 **Gestion complète des élections** : Création, gestion des statuts (Brouillon, Campagne, Vote, Clôturé).
- 👥 **Profils candidats avec engagement social** : Slogans, programmes, likes, commentaires, Q&A modérés.
- 📊 **Résultats temps réel avec graphiques + export PDF** : Suivi de la participation en live et export openPDF.
- 🤖 **Chatbot d'assistance hybride** : Règles prédéfinies et assistance IA optionnelle intégrée.
- 🔔 **Notifications cross-modules en temps réel** : Restez informé des nouvelles élections, validations, etc.
- 🌓 **Mode sombre / clair** : Interface moderne s'adaptant dynamiquement aux préférences de l'utilisateur.
- 📱 **Design responsive mobile-first** : UX fluide sur toutes les résolutions d'écran.
- 🔐 **Authentification JWT + OTP par email** : Sécurité renforcée lors de l'inscription.

## 🛠️ Stack technique

| **Frontend** | **Version** | **Usage** |
| :--- | :---: | :--- |
| React | 18 | Bibliothèque UI principale |
| TypeScript | 5.x | Typage statique robuste |
| Vite | 5.x | Bundler ultra-rapide |
| Tailwind CSS | 3.4 | Styling utilitaire et thèmes |
| shadcn/ui | latest | Composants UI accessibles |
| Zustand | latest | Gestion d'état globale |
| Axios | latest | Client HTTP |
| Framer Motion | latest | Animations fluides |
| Recharts | latest | Graphiques interactifs |
| Lucide React | latest | Bibliothèque d'icônes |
| date-fns | latest | Formatage et manipulation de dates |

| **Backend** | **Version** | **Usage** |
| :--- | :---: | :--- |
| Spring Boot | 3.3.5 | Framework principal |
| Java | 21 LTS | Langage backend |
| Spring Security | latest | Sécurisation et permissions |
| Spring Data JPA | latest | Accès aux données et requêtes |
| Hibernate | latest | ORM (Object-Relational Mapping) |
| JWT (jjwt) | latest | Gestion des tokens stateless |
| Spring Mail | latest | Envoi d'emails (OTP via Mailtrap) |
| Lombok | latest | Réduction du code boilerplate |
| OpenPDF | latest | Génération de rapports PDF |
| Bean Validation | latest | Validation stricte des DTOs |

| **DevOps & Data** | **Version** | **Usage** |
| :--- | :---: | :--- |
| MariaDB / MySQL | 8+ | Base de données relationnelle (via XAMPP) |

## ⚙️ Prérequis

- **Java 21 LTS** (Temurin recommandé)
- **Node.js v18+** (v22.17.0 testé)
- **npm v9+**
- **XAMPP** avec MariaDB/MySQL (version 8+)
- **Git**
- **Compte Mailtrap** (gratuit) pour l'envoi d'emails OTP en développement
- **Maven** (utilise le wrapper inclus `./mvnw`, pas besoin d'installer)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-user/EasyVote.git
cd EasyVote
```

### 2. Configuration backend

1. Démarrer XAMPP (Apache + MySQL).
2. Créer la base de données : `phpMyAdmin` → `New` → Database `easyvote_db` (utf8mb4).
3. Modifier le fichier `easyvote-backend/src/main/resources/application.properties` :
   - Assurez-vous que l'URL JDBC, user/password correspondent à votre BDD locale (`root` par défaut, sans mot de passe).
   - Configuration Mailtrap : définissez `username` et `password`.
   - JWT secret : peut rester par défaut pour le développement local.
4. Compiler le backend :
```bash
cd easyvote-backend
./mvnw clean install
# (ou .\mvnw.cmd clean install sous Windows)
```

### 3. Configuration frontend

```bash
cd easyvote-frontend
npm install
```

## 🏃 Démarrage rapide

Ouvrez deux terminaux à la racine de votre projet :

**Terminal 1 - Backend (port 8082)**
```bash
cd easyvote-backend
./mvnw spring-boot:run
# (ou .\mvnw.cmd spring-boot:run)
```

**Terminal 2 - Frontend (port 5173)**
```bash
cd easyvote-frontend
npm run dev
```

Puis ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

## 🏗️ Architecture

```text
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   FRONTEND      │  HTTPS  │    BACKEND      │   JPA   │   DATABASE      │
│   React 18      │◄──────► │  Spring Boot    │◄──────► │   MariaDB       │
│   TypeScript    │ JSON    │   Java 21       │         │   12 entités    │
│   Tailwind      │         │   JWT Stateless │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Port 5173                  Port 8082                    Port 3306
```

L'architecture d'EasyVote est **stateless, scalable et sécurisée**.

### Architecture en couches du backend
- **Controller** : Gère les requêtes HTTP et valide les inputs (DTOs).
- **Service** : Contient toute la logique métier complexe et transactionnelle.
- **Repository** : Interfaces Spring Data JPA pour les interactions avec la base de données.
- **Entity** : Modèles de données mappés aux tables de la base de données.

### Modules fonctionnels
1. **Module Authentification & Sécurité** : Inscription avec OTP, JWT, rôles dynamiques.
2. **Module Administration & Élections** : Paramétrage des dates, gestion des candidatures.
3. **Module Étudiant & Engagement** : Votes sécurisés, suivi live, mur de campagne interactif.

## 📁 Structure du projet

```text
EasyVote/
├── easyvote-backend/
│   ├── src/main/java/com/easyvote/backend/
│   │   ├── config/          # Configurations (Security, CORS, JPA)
│   │   ├── controller/      # Endpoints REST (10 controllers)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # Entités JPA (12 entités)
│   │   ├── exception/       # Exceptions custom + handler global
│   │   ├── repository/      # Spring Data Repositories
│   │   ├── security/        # JWT + UserDetails
│   │   └── service/         # Logique métier
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── easyvote-frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   │   ├── chatbot/     # Widget chatbot
│   │   │   ├── effects/     # Aurora, FloatingOrbs
│   │   │   ├── layout/      # Sidebar, Topbar, DashboardLayout
│   │   │   ├── shared/      # CountdownTimer, LoadingSpinner
│   │   │   └── ui/          # shadcn/ui
│   │   ├── hooks/           # useNotifications, useTheme
│   │   ├── lib/             # api.ts, utils.ts, constants.ts
│   │   ├── pages/           # Pages organisées par rôle
│   │   │   ├── admin/       # ManageElections, ManageCandidates...
│   │   │   ├── auth/        # Login, Register, OtpVerify
│   │   │   ├── candidate/   # MyCampaign
│   │   │   ├── public/      # HomePage
│   │   │   └── student/     # Elections, Vote, Results...
│   │   ├── routes/          # AppRouter avec lazy loading
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand authStore
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
└── README.md (ce fichier)
```

## 👥 Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `ahmed@test.com` | `password123` | ADMIN |
| `achref@test.com` | `password123` | STUDENT (peut postuler) |
| `dali@test.com` | `password123` | STUDENT |
| `moez@test.com` | `password123` | STUDENT/CANDIDATE |
| `talel@test.com` | `password123` | STUDENT |

*Note : pour activer un nouveau compte sans passer par Mailtrap, exécutez la requête SQL : `UPDATE users SET is_verified = true WHERE email = 'votre_email';`*

## 🔌 Endpoints API

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| **POST** | `/api/auth/register` | Inscription nouvel étudiant | - |
| **POST** | `/api/auth/login` | Authentification utilisateur | - |
| **POST** | `/api/auth/verify-otp` | Vérification code OTP (email) | - |
| **GET** | `/api/auth/me` | Récupère le profil connecté | JWT |
| **GET** | `/api/elections` | Liste toutes les élections | JWT |
| **POST** | `/api/elections` | Crée une nouvelle élection | ADMIN |
| **PATCH** | `/api/elections/{id}/status` | Met à jour le statut de l'élection | ADMIN |
| **POST** | `/api/candidates/apply` | Soumet une candidature | STUDENT |
| **POST** | `/api/candidates/{id}/validate` | Valide une candidature | ADMIN |
| **POST** | `/api/candidates/{id}/like` | Like un profil de campagne | JWT |
| **POST** | `/api/elections/{id}/vote` | Soumet un vote anonyme sécurisé | STUDENT |
| **GET** | `/api/elections/{id}/results` | Résultats détaillés / partiels | JWT |
| **GET** | `/api/elections/{id}/results/pdf`| Télécharge le PDF des résultats | JWT |
| **POST** | `/api/chatbot/message` | Dialoguer avec l'assistant hybride| - |
| **GET** | `/api/notifications` | Historique des notifications | JWT |
| **GET** | `/api/notifications/unread/count`| Compteur notifs non lues | JWT |

*(Documentation complète disponible dans les fichiers API ou Postman associés)*

## 📸 Captures d'écran

| Page d'accueil | Tableau de bord |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Détail élection | Vote |
|---|---|
| ![Election](docs/screenshots/election.png) | ![Vote](docs/screenshots/vote.png) |

| Résultats | Chatbot |
|---|---|
| ![Results](docs/screenshots/results.png) | ![Chatbot](docs/screenshots/chatbot.png) |

*(Screenshots à ajouter dans docs/screenshots/)*

## 🗺️ Roadmap

- [x] **MVP** — 3 modules fonctionnels principaux livrés
- [ ] **V1.0 production** — Déploiement cloud
- [ ] **App mobile** — Développée en React Native
- [ ] **Multi-langue** — AR, EN, FR
- [ ] **SSO universitaire** — Intégration identité académique
- [ ] **API publique** — Marketplace

## 👤 Auteur

**Ahmed Ltayef**
- GitHub : [@ahmed-ltayef](https://github.com/ahmed-ltayef)
- *Projet réalisé dans le cadre du module Génie Logiciel — 2026*

## 📜 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- À l'équipe pédagogique pour le cadrage du projet.
- À la communauté open-source pour les excellents frameworks utilisés.
