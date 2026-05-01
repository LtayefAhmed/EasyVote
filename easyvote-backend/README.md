# EasyVote Backend

Backend de la plateforme **EasyVote** — système de gestion des élections universitaires.

## Stack Technique

| Technologie       | Version   |
|--------------------|-----------|
| Spring Boot        | 3.3.5     |
| Java               | 21        |
| Base de données    | MariaDB (XAMPP) |
| Authentification   | JWT (jjwt 0.12.6) |
| Communication temps réel | WebSocket |
| Génération PDF     | OpenPDF   |

## Prérequis

- **Java 21** (JDK installé et `JAVA_HOME` configuré)
- **XAMPP** avec MySQL/MariaDB démarré
- Base de données `easyvote_db` créée :
  ```sql
  CREATE DATABASE easyvote_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

## Installation & Lancement

```bash
# Cloner le projet
git clone <url-du-repo>
cd easyvote-backend

# Compiler le projet
.\mvnw.cmd clean install

# Lancer l'application
.\mvnw.cmd spring-boot:run
```

## URL Backend

- **API** : [http://localhost:8080](http://localhost:8080)

## Structure du Projet

```
src/main/java/com/easyvote/backend/
├── config/        # Configurations (Security, CORS, WebSocket, Mail)
├── controller/    # REST Controllers
├── dto/           # Data Transfer Objects (request/response)
├── entity/        # Entités JPA
├── repository/    # Spring Data JPA Repositories
├── service/       # Logique métier
├── security/      # JWT, filtres d'authentification
├── exception/     # Gestion globale des exceptions
└── BackendApplication.java
```

## Configuration

La configuration principale se trouve dans `src/main/resources/application.properties`.

- **Base de données** : MariaDB sur `localhost:3306/easyvote_db` (root, sans mot de passe)
- **JWT** : Secret et durées d'expiration configurables
- **Mail** : Mailtrap (sandbox) — remplacer les placeholders
- **CORS** : Autorise `localhost:5173` et `localhost:3000`

## Licence

Projet universitaire — Usage académique uniquement.
