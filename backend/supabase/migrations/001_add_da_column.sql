-- Migration: Add da (Danish) column to entries table
-- Run this SQL in Supabase SQL Editor or via migration tool

ALTER TABLE entries ADD COLUMN IF NOT EXISTS da TEXT;
