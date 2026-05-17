🚗 Gestion de Véhicules - Notice d'utilisation
Version : v1.1.0
Type : Application 100% hors ligne
Plateformes : Web, Windows/macOS/Linux, Android


📖 Description
Application conçue pour suivre et organiser l'ensemble de vos véhicules en un seul endroit. Gérez les informations générales, l'état des pneumatiques, les niveaux de liquides, et le carnet d'entretien, le tout sans connexion internet et avec une interface adaptée à tous les écrans.


✨ Fonctionnalités principales

📋 Fiches véhicules
Propriétaire, marque, modèle, année, moteur, énergie, kilométrage, immatriculation, VIN

🛞 Pneumatiques
Marque, taille, pression, date de montage (avant/arrière), dernier contrôle

💧 Liquides & Huiles
Moteur, transmission, refroidissement, frein, lave-glace (marque, capacité, kilométrage, notes)

🔧 Entretien
Kit distribution, vidange, liquide frein, rotation pneus, contrôle général (km, date, notes)

🔍 Recherche & Tri
Filtrage par champ + tri dynamique (A→Z / Z→A, ↑↓)

🌙 Mode sombre
Bascule manuel ou automatique (sauvegarde de la préférence)

🔐 Sécurité
Mot de passe local (hash SHA-256), suppression facile

📤 Export/Import
JSON (backup complet) ou CSV (compatible Excel/LibreOffice)

📱 Multi-support
Navigateur, exécutable bureau (.exe), application mobile (.apk)


📥 Installation & Accès

💻 Navigateur (PC/Mac/Linux)
Décompressez l'archive du projet.
Double-cliquez sur index.html.
L'application s'ouvre directement dans votre navigateur par défaut.

🖥️ Application Bureau (.exe)
Lancez l'installateur Gestion de Véhicules Setup v1.1.0.exe.
Suivez les étapes d'installation.
Les données sont sauvegardées dans : %APPDATA%\gestion-vehicules\vehicules_db.json
Astuce : Pour synchroniser entre plusieurs PC, placez ce fichier dans un dossier cloud (Google Drive, OneDrive, etc.) et modifiez son chemin dans main.js avant de recompiler.

📱 Application Mobile (.apk)
Téléchargez GestionVehicules_v1.1.0.apk.zip et extrayez-le.
Sur Android : Paramètres → Sécurité → Autoriser les sources inconnues (ou Apps → Accès spécial → Installer des applis inconnues).
Ouvrez le fichier .apk → Installer → Ouvrir.
Les données restent stockées dans l'espace privé de l'application.


🛠️ Guide d'utilisation

➕ Ajouter
Bouton ➕ → remplissez les champs * → ✅ Valider

👁️ Consulter
Cliquez sur une ligne de la liste → détails complets

✏️ Modifier
Dans la fiche → ✏️ Modifier → éditez → ✅ Valider

🗑️ Supprimer
Dans la fiche → 🗑️ Supprimer → confirmez l'alerte

🔍 Rechercher
Cliquez sur 🔍 → tapez un terme → choisissez le champ cible

↕️ Trier
Cliquez sur ↕️ → sélectionnez un critère → recliquez pour inverser (↑/↓)

🌙 Thème
Interrupteur en haut à droite. La préférence est mémorisée.

🔐 Mot de passe
🔒 → Définir ou Gérer → Laissez "Nouveau" vide pour supprimer


🔒 Sécurité & Données

✅ 100% hors ligne : Aucune donnée n'est envoyée sur internet.

🔐 Chiffrement local : Le mot de passe est hashé en SHA-256. Il ne peut pas être récupéré en cas d'oubli.

🗑️ Suppression du mot de passe : Cliquez sur 🔒 → entrez le mot de passe actuel → laissez le champ "Nouveau mot de passe" vide → 💾 Appliquer.

💾 Backup recommandé : Exportez régulièrement votre base en JSON pour garder une copie de sécurité.

📤 Export & Import
.json
Recommandé : sauvegarde complète, conserve toutes les sous-données (pneus, liquides, entretien)
.csv
Tableur : s'ouvre dans Excel/LibreOffice. Les champs imbriqués sont aplatissés (tires__front__brand). Idéal pour consultation ou impression.
Importer un fichier :
Cliquez sur 📥 Importer
Sélectionnez un fichier .json ou .csv
Confirmez le remplacement de la base actuelle.


❓ Dépannage & FAQ

🔐 L'app demande un mot de passe au démarrage alors que je n'en ai pas
Ouvrez F12 → Console → tapez localStorage.removeItem('db_password_hash'); location.reload();

📱 L'APK ne s'installe pas sur Android
Activez Sources inconnues dans les paramètres de sécurité. Sur Android 8+, autorisez l'appli (Fichiers/Chrome) à installer des APK.

💾 Mes données n'apparaissent pas sur un autre PC
Vérifiez que le fichier vehicules_db.json est bien présent et synchronisé, ou utilisez la fonction Export/Import.

🌙 Le thème sombre ne change pas
Forcez le rechargement avec Ctrl+F5. La préférence est stockée localement.


👥 Crédits & Licence

Conception & Développement : Thao

Architecture & Assistance technique : Qwen (IA)

Logos : Créations personnelles pour usage privé

Licence : Utilisation personnelle uniquement. © 2026 - Tous droits réservés.
