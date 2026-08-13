#!/bin/bash

# Sospende lo script in caso di errori
set -e

# Trova il nome del ramo corrente (es. master o main)
current_branch=$(git branch --show-current)

# Sincronizza le modifiche impostando il tracciamento se manca
echo "🔄 Aggiornamento da remoto per il ramo $current_branch..."
git pull origin "$current_branch" --set-upstream || echo "⚠️ Impossibile aggiornare (forse il repository remoto è vuoto). Procedo..."

# Aggiunge tutti i file modificati e nuovi
echo "➕ Aggiunta file..."
git add .

# Chiede all'utente di inserire il messaggio del commit
echo "💬 Inserisci il messaggio del commit:"
read -r commit_message

# Esegue il commit con il messaggio inserito
git commit -m "$commit_message"

# Invia i file su GitHub impostando il collegamento corretto
echo "🚀 Push su GitHub sul ramo $current_branch..."
git push -u origin "$current_branch"

echo "✅ Completato con successo!"
