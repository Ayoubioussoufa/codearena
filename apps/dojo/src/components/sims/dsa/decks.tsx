"use client";
import { BUDGET, PATTERN } from "@/lib/sims/dsa/decks";
import { CardStation } from "../engines";

export const Pattern = () => <CardStation id="pattern" deck={PATTERN} />;
export const Budget = () => <CardStation id="budget" deck={BUDGET} />;
