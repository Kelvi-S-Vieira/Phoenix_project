/**
 * Hand-written types mirroring supabase/schema.sql.
 *
 * These are written by hand for this sprint. Once you have a live Supabase
 * project, regenerate this file for perfect accuracy with:
 *   npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
 */

export type Role = "aluno" | "personal";

export type Goal = "perder" | "ganhar" | "manter" | "recomp";

export type ActivityLevel =
  | "sedentario"
  | "leve"
  | "moderado"
  | "intenso"
  | "atleta";

export type Tier = "treino-basico" | "treino-intermediario" | "treino-avancado";

export type Profile = {
  id: string;
  role: Role | null;
  name: string | null;
  linked_personal_id: string | null;
  code: string | null;
  goal: Goal | null;
  current_weight: number | null;
  target_weight: number | null;
  height: number | null;
  age: number | null;
  sex: "M" | "F" | null;
  activity_level: ActivityLevel | null;
  calorie_target: number | null;
  protein_target: number | null;
  current_tier: Tier | null;
  current_split: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type WeightLog = {
  id: string;
  profile_id: string;
  weight: number;
  logged_at: string;
  created_at: string;
};

export type Measurement = {
  id: string;
  profile_id: string;
  values: Record<string, number>;
  logged_at: string;
  created_at: string;
};

export type ProgressPhoto = {
  id: string;
  profile_id: string;
  storage_path: string;
  taken_at: string;
  created_at: string;
};

export type WorkoutTemplate = {
  id: string;
  personal_id: string;
  name: string;
  tier: Tier;
  split: string;
  note: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  aluno_id: string;
  personal_id: string;
  sender_role: Role;
  text: string;
  created_at: string;
};

export type ActivityDay = {
  id: string;
  profile_id: string;
  activity_date: string;
  created_at: string;
};

export type BadgeUnlocked = {
  id: string;
  profile_id: string;
  badge_key: string;
  unlocked_at: string;
};

export type CustomPlan = {
  id: string;
  profile_id: string;
  weeks: number;
  diet_choice: string | null;
  tier: Tier | null;
  split: string | null;
  start_date: string;
  created_at: string;
};

// Minimal Database generic shape so @supabase/ssr's / supabase-js's generics
// compile and give us real autocomplete + type-checking on .from(...) calls.
// Not exhaustive (Insert/Update variants collapse to Partial<Row>, no
// Relationships) — good enough for this sprint's hand-written queries;
// replace with a generated file once there's a live project:
//   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      weight_logs: Table<WeightLog>;
      measurements: Table<Measurement>;
      progress_photos: Table<ProgressPhoto>;
      workout_templates: Table<WorkoutTemplate>;
      chat_messages: Table<ChatMessage>;
      activity_days: Table<ActivityDay>;
      badges_unlocked: Table<BadgeUnlocked>;
      custom_plans: Table<CustomPlan>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: Role;
      goal_type: Goal;
      activity_level: ActivityLevel;
      training_tier: Tier;
    };
    CompositeTypes: Record<string, never>;
  };
};
