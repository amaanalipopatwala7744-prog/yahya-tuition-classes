import { createActor } from "@/backend";
/**
 * Wraps core-infrastructure useActor with the backend createActor factory.
 * Import { useActor } from this file anywhere you need the typed backend actor.
 */
import { useActor as useCoreActor } from "@caffeineai/core-infrastructure";

export function useActor() {
  return useCoreActor(createActor);
}
