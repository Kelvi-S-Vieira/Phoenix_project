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
  // Diário targets (see /diario, supabase/migration_diary.sql).
  carb_target: number | null;
  fat_target: number | null;
  timeframe_weeks: number | null;
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

export type Pose = "frente" | "lado" | "costas";

export type ProgressPhoto = {
  id: string;
  profile_id: string;
  storage_path: string;
  taken_at: string;
  pose: Pose | null;
  weight_at_photo: number | null;
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

export type WorkoutLogEntry = {
  id: string;
  profile_id: string;
  logged_at: string;
  exercise_id: string;
  checked: boolean;
  sets: number | null;
  reps: number | null;
  load: number | null;
  created_at: string;
  updated_at: string;
};

// Plan for the Avançado tier's full custom training builder
// (app/treino/avancado/AvancadoBuilder.tsx). `week` is the whole
// AvancadoPlan blob (see lib/treino-avancado-builder.ts) — day->groups/
// selections/calistenia/warmup/cardio/sports/generic-entries, plus the
// equipment/level filters and the last-used template key — not just a
// day->group-keys map, despite the column name (kept short/stable; see the
// migration's comment for why one jsonb blob is appropriate here).
export type AvancadoPlanRow = {
  id: string;
  profile_id: string;
  body_weight: number | null;
  body_age: number | null;
  body_height: number | null;
  body_sex: "masculino" | "feminino" | null;
  week: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// Dashboard "Cargas" card — one row per tracked lift. See
// supabase/migration_dashboard_lifts_cardio.sql.
export type Lift = {
  id: string;
  profile_id: string;
  name: string;
  unit: string;
  start_value: number;
  current_value: number;
  goal_value: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Dashboard "Cardio" card — one row per profile, flat boolean-per-weekday,
// mirroring the prototype's localStorage array model. See
// supabase/migration_dashboard_lifts_cardio.sql.
export type WeeklyCardio = {
  profile_id: string;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
  updated_at: string;
};

export type Meal = "cafe" | "almoco" | "lanche" | "jantar" | "extra";

// Diário (food diary) entries — one row per logged food item. See
// app/diario and supabase/migration_diary.sql.
export type DiaryEntry = {
  id: string;
  profile_id: string;
  logged_at: string;
  meal: Meal;
  food_name: string;
  quantity: number | null;
  unit: string | null;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  source: "db" | "manual";
  created_at: string;
  updated_at: string;
};

// Column-limited view backing invite-code lookup — see
// supabase/schema.sql's public.personal_lookup. Never query `profiles`
// directly by `code` from the client.
export type PersonalLookup = {
  id: string;
  name: string | null;
  code: string | null;
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
      workout_log_entries: Table<WorkoutLogEntry>;
      avancado_plans: Table<AvancadoPlanRow>;
      lifts: Table<Lift>;
      weekly_cardio: Table<WeeklyCardio>;
      diary_entries: Table<DiaryEntry>;
    };
    Views: {
      personal_lookup: {
        Row: PersonalLookup;
        Relationships: [];
      };
    };
    Functions: {
      redeem_invite_code: {
        Args: { p_code: string };
        Returns: { personal_id: string; personal_name: string | null }[];
      };
      complete_oauth_profile: {
        Args: { p_role: Role; p_name: string; p_invite_code?: string | null };
        Returns: void;
      };
    };
    Enums: {
      profile_role: Role;
      goal_type: Goal;
      activity_level: ActivityLevel;
      training_tier: Tier;
    };
    CompositeTypes: Record<string, never>;
  };
};
