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

export type Tier =
  | "treino-basico"
  | "treino-intermediario"
  | "treino-avancado"
  | "treino-terceira-idade";

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
  // Weekly session-frequency goal for the Terceira Idade tier (2/3/4/5x) —
  // kept directly on profiles like other per-user prefs, see
  // supabase/migration_terceira_idade.sql.
  senior_freq_goal: number;
  // Avançado tier's training-level filter ("iniciante"/"intermediario"/
  // "avancado"/"idoso"), decided once at cadastro instead of a live filter
  // box (see supabase/migration_avancado_level.sql).
  avancado_level: string | null;
  // Avançado tier's equipment filter, persisted as a profile-level
  // preference (see supabase/migration_avancado_equipment_pref.sql).
  // Record<string, boolean> keyed by EQUIPMENT_TYPES keys, or null if
  // never saved.
  avancado_equipment_filter: Record<string, boolean> | null;
  // Vegetarian/vegan flag for supplement recommendations (see
  // supabase/migration_dietary_preference.sql).
  dietary_preference: "onivoro" | "vegetariano" | "vegano" | null;
  // Diet type (macro split) + intermittent-fasting window (see
  // supabase/migration_diet_type.sql).
  diet_type: "equilibrada" | "mediterranea" | "lowcarb" | "cetogenica" | "altaproteina" | "jejum" | null;
  fasting_window: string | null;
  // Anchors Calendário's rolling window when there's no active custom_plans
  // row (see supabase/migration_plano.sql).
  calendar_start_date: string | null;
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
  updated_at: string;
};

export type CalendarDayStatus = "treino" | "cardio" | "descanso";

export type CalendarDay = {
  profile_id: string;
  day_date: string;
  status: CalendarDayStatus | null;
  note: string | null;
  updated_at: string;
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

// Training-log history backing Avançado's Musculação 1RM/PR/progression/
// deload/swap feature (see lib/treino-progression.ts). One row per logged
// set, many per exercise_key (the day-independent exerciseKey()). See
// supabase/migration_exercise_set_logs.sql.
export type ExerciseSetLog = {
  id: string;
  profile_id: string;
  exercise_key: string;
  logged_at: string;
  weight: number;
  reps: number;
  rpe: number | null;
  pain: boolean;
  created_at: string;
};

// Simple cardio log (corrida/bike/elíptico/natação, duração + intensidade)
// backing the "🏃 Cardio" tab shared by Básico and Intermediário
// (app/treino/TreinoBoard.tsx) — NO calorie/MET calculation, unlike
// Avançado's own cardio system. See supabase/migration_cardio_log.sql.
export type CardioLogEntry = {
  id: string;
  profile_id: string;
  day_key: "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
  activity_key: string;
  duration: number | null;
  intensity: "leve" | "moderado" | "intenso";
  created_at: string;
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
  source: "db" | "manual" | "ai_photo" | "ai_text";
  created_at: string;
  updated_at: string;
};

// Montar Plano's "plano inicial recomendado" step (see
// app/montar-plano/PlanSetupForm.tsx, supabase/migration_plan_recommendations.sql)
// — which Supplements/Receitas Fit catalog items (by name) the user accepted
// when creating a plan with no linked personal. Marmita picks go into
// user_recipes/meal_prep_plan instead (see above).
export type PlanRecommendationPick = {
  id: string;
  profile_id: string;
  kind: "supplement" | "receita_fit";
  ref_name: string;
  created_at: string;
};

// Alimentação / Marmitas — a user's own meal-prep recipes. `ingredients` is
// a jsonb array of {name, qty, unit} (variable-length, never queried into,
// so jsonb is appropriate here unlike diary_entries' flat columns). See
// app/alimentacao/marmitas and supabase/migration_alimentacao.sql.
export type UserRecipeIngredient = {
  name: string;
  qty: number;
  unit: string;
};

export type UserRecipe = {
  id: string;
  profile_id: string;
  name: string;
  yield_count: number;
  ingredients: UserRecipeIngredient[];
  created_at: string;
  updated_at: string;
};

// One row per (user, recipe) the user has planned for the week, with a
// desired marmita count. Rows are upserted/deleted as counts change (no
// zero-count rows kept around) — see PlanTab.tsx.
export type MealPrepPlan = {
  profile_id: string;
  user_recipe_id: string;
  desired_count: number;
  updated_at: string;
};

// Free-form shopping-list items (not tied to any recipe/ingredient).
export type ShoppingExtra = {
  id: string;
  profile_id: string;
  name: string;
  checked: boolean;
  created_at: string;
};

// Terceira Idade — session types the tier offers (see
// lib/terceira-idade-data.ts for the exercise content itself).
export type SeniorSessionType = "mobilidade" | "equilibrio" | "fortalecimento";

// Terceira Idade — checked/unchecked state per (profile, session, exercise)
// for the CURRENT completion cycle, so progress persists across reloads.
// Cleared (all rows deleted for that session) once it's logged fully done
// and the user starts over — see app/treino/terceira-idade/TerceiraIdadeBoard.tsx.
export type SeniorSessionChecklistRow = {
  profile_id: string;
  session_type: SeniorSessionType;
  exercise_idx: number;
  checked: boolean;
  updated_at: string;
};

// Terceira Idade — one row logged each time a session is fully completed
// (mirrors the prototype's `weeklyLog` push). What "sessões concluídas esta
// semana" counts against `profiles.senior_freq_goal`. Deliberately NOT
// activity_days — this tier keeps its own weekly completion tracking and
// does not feed the main dashboard streak.
export type SeniorSessionCompletion = {
  id: string;
  profile_id: string;
  session_type: SeniorSessionType;
  completed_at: string;
  feeling: "otima" | "ok" | "dificil" | null;
  created_at: string;
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
      calendar_days: Table<CalendarDay>;
      workout_log_entries: Table<WorkoutLogEntry>;
      cardio_log_entries: Table<CardioLogEntry>;
      avancado_plans: Table<AvancadoPlanRow>;
      exercise_set_logs: Table<ExerciseSetLog>;
      lifts: Table<Lift>;
      weekly_cardio: Table<WeeklyCardio>;
      diary_entries: Table<DiaryEntry>;
      plan_recommendation_picks: Table<PlanRecommendationPick>;
      user_recipes: Table<UserRecipe>;
      meal_prep_plan: Table<MealPrepPlan>;
      shopping_extras: Table<ShoppingExtra>;
      senior_session_checklist: Table<SeniorSessionChecklistRow>;
      senior_session_completions: Table<SeniorSessionCompletion>;
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
