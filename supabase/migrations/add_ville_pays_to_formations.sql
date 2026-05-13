-- Ajouter les colonnes manquantes à la table formations
-- À exécuter dans le SQL Editor du dashboard Supabase

ALTER TABLE formations
  ADD COLUMN IF NOT EXISTS ville TEXT,
  ADD COLUMN IF NOT EXISTS pays  TEXT;
