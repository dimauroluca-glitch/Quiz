#!/bin/bash

# Esci immediatamente se un comando fallisce
set -e

# Chiede il messaggio di commit all'utente
echo "Inserisci il messaggio di commit:"
read -r commit_message

# Controlla che il messaggio non sia vuoto
if [ -z "$commit_message" ]; then
    echo "Errore: Il messaggio di commit non può essere vuoto."
    exit 1
fi

# Esegue i comandi Git
git add .
git commit -m "$commit_message"
git push

echo "Push completato con successo!"

