/**
 * Static food reference database for the Diário (food diary) feature.
 *
 * Ported verbatim from the prototype's `FOOD_DB` constant
 * (projeto_fenix_app_final.html, lines 17299-17547) via a brace-matched
 * extraction + vm eval (not hand-transcribed) to avoid transcription errors
 * across 200+ nutrition entries. Each item's kcal/protein/carb/fat values
 * are per the stated `per` amount of `unit` (e.g. per 100g, or per 1
 * unid/fatia/scoop/etc) — see lib/food-database.ts usage in app/diario for
 * how a quantity scales these.
 *
 * This is reference content, not user data, so it stays static TS data
 * rather than a Supabase table — matching this project's established
 * pattern for exercise pools (lib/treino-basico-data.ts etc).
 */

export interface FoodDbItem {
  name: string;
  per: number;
  unit: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  /** Optional: weight in grams of ONE `unit` (only for counted units: unid, fatia, scoop...), to convert g <-> units. */
  gramsPerUnit?: number;
}

const FOOD_DB_BASE: FoodDbItem[] = [
  { name: 'Peito de frango grelhado', per: 100, unit: 'g', kcal: 165, protein: 31, carb: 0, fat: 3.6 },
  { name: 'Frango desfiado', per: 100, unit: 'g', kcal: 165, protein: 31, carb: 0, fat: 3.6 },
  { name: 'Carne magra (patinho/coxão mole)', per: 100, unit: 'g', kcal: 137, protein: 26, carb: 0, fat: 3 },
  { name: 'Carne de panela (acém/músculo)', per: 100, unit: 'g', kcal: 220, protein: 26, carb: 0, fat: 12 },
  { name: 'Tilápia/peixe branco', per: 100, unit: 'g', kcal: 96, protein: 20, carb: 0, fat: 1.7 },
  { name: 'Salmão', per: 100, unit: 'g', kcal: 208, protein: 20, carb: 0, fat: 13 },
  { name: 'Atum em lata (água), escorrido', per: 100, unit: 'g', kcal: 116, protein: 26, carb: 0, fat: 1 },
  { name: 'Ovo inteiro', per: 1, unit: 'unid', kcal: 70, protein: 6, carb: 0.6, fat: 5, gramsPerUnit: 50 },
  { name: 'Clara de ovo', per: 1, unit: 'unid', kcal: 17, protein: 3.6, carb: 0.2, fat: 0.1, gramsPerUnit: 33 },
  { name: 'Queijo cottage', per: 100, unit: 'g', kcal: 98, protein: 11, carb: 3.4, fat: 4.3 },
  { name: 'Queijo minas/branco', per: 100, unit: 'g', kcal: 264, protein: 17, carb: 3, fat: 20 },
  { name: 'Iogurte natural desnatado', per: 100, unit: 'g', kcal: 55, protein: 5, carb: 7, fat: 0.2 },
  { name: 'Iogurte grego natural', per: 100, unit: 'g', kcal: 97, protein: 9, carb: 4, fat: 5 },
  { name: 'Whey protein (1 scoop)', per: 1, unit: 'scoop', kcal: 120, protein: 24, carb: 3, fat: 1, gramsPerUnit: 30 },
  { name: 'Frango moído', per: 100, unit: 'g', kcal: 165, protein: 31, carb: 0, fat: 3.6 },
  { name: 'Arroz branco cozido', per: 100, unit: 'g', kcal: 130, protein: 2.7, carb: 28, fat: 0.3 },
  { name: 'Arroz integral cozido', per: 100, unit: 'g', kcal: 123, protein: 2.6, carb: 26, fat: 1 },
  { name: 'Batata-doce cozida', per: 100, unit: 'g', kcal: 86, protein: 1.6, carb: 20, fat: 0.1 },
  { name: 'Batata inglesa cozida', per: 100, unit: 'g', kcal: 87, protein: 2, carb: 20, fat: 0.1 },
  { name: 'Mandioca/aipim cozida', per: 100, unit: 'g', kcal: 80, protein: 1.5, carb: 19, fat: 0.3 },
  { name: 'Mandioquinha cozida', per: 100, unit: 'g', kcal: 80, protein: 1.5, carb: 18, fat: 0.2 },
  { name: 'Macarrão integral cozido', per: 100, unit: 'g', kcal: 124, protein: 5, carb: 25, fat: 1 },
  { name: 'Pão integral (fatia)', per: 1, unit: 'fatia', kcal: 70, protein: 3.5, carb: 12, fat: 1, gramsPerUnit: 25 },
  { name: 'Aveia em flocos', per: 100, unit: 'g', kcal: 389, protein: 13, carb: 66, fat: 7 },
  { name: 'Feijão cozido', per: 100, unit: 'g', kcal: 76, protein: 4.8, carb: 14, fat: 0.5 },
  { name: 'Quinoa cozida', per: 100, unit: 'g', kcal: 120, protein: 4.4, carb: 21, fat: 1.9 },
  { name: 'Tapioca (goma pronta)', per: 100, unit: 'g', kcal: 140, protein: 0.2, carb: 34, fat: 0 },
  { name: 'Cuscuz de milho pronto', per: 100, unit: 'g', kcal: 110, protein: 2.5, carb: 23, fat: 1 },
  { name: 'Brócolis cozido', per: 100, unit: 'g', kcal: 35, protein: 2.8, carb: 7, fat: 0.4 },
  { name: 'Cenoura', per: 100, unit: 'g', kcal: 41, protein: 0.9, carb: 10, fat: 0.2 },
  { name: 'Abobrinha', per: 100, unit: 'g', kcal: 17, protein: 1.2, carb: 3, fat: 0.3 },
  { name: 'Vagem', per: 100, unit: 'g', kcal: 31, protein: 1.8, carb: 7, fat: 0.1 },
  { name: 'Salada verde (alface/rúcula/tomate)', per: 100, unit: 'g', kcal: 18, protein: 1, carb: 3, fat: 0.2 },
  { name: 'Tomate cereja', per: 100, unit: 'g', kcal: 18, protein: 0.9, carb: 3.9, fat: 0.2 },
  { name: 'Azeite de oliva', per: 1, unit: 'colher sopa', kcal: 120, protein: 0, carb: 0, fat: 14 },
  { name: 'Castanhas (mix)', per: 100, unit: 'g', kcal: 600, protein: 15, carb: 20, fat: 54 },
  { name: 'Abacate', per: 100, unit: 'g', kcal: 160, protein: 2, carb: 9, fat: 15 },
  { name: 'Pasta de amendoim', per: 1, unit: 'colher sopa', kcal: 95, protein: 4, carb: 3, fat: 8 },
  { name: 'Requeijão light', per: 1, unit: 'colher sopa', kcal: 30, protein: 1.5, carb: 1, fat: 2 },
  { name: 'Banana', per: 1, unit: 'unid', kcal: 89, protein: 1.1, carb: 23, fat: 0.3, gramsPerUnit: 100 },
  { name: 'Maçã', per: 1, unit: 'unid', kcal: 95, protein: 0.5, carb: 25, fat: 0.3, gramsPerUnit: 180 },
  { name: 'Laranja', per: 1, unit: 'unid', kcal: 62, protein: 1.2, carb: 15, fat: 0.2, gramsPerUnit: 130 },
  { name: 'Morango', per: 100, unit: 'g', kcal: 32, protein: 0.7, carb: 7.7, fat: 0.3 },
  { name: 'Mamão', per: 100, unit: 'g', kcal: 43, protein: 0.5, carb: 11, fat: 0.2 },
  { name: 'Pão francês', per: 1, unit: 'unid', kcal: 135, protein: 4, carb: 28, fat: 1, gramsPerUnit: 50 },
  { name: 'Pão de forma branco (fatia)', per: 1, unit: 'fatia', kcal: 80, protein: 2.5, carb: 15, fat: 1, gramsPerUnit: 25 },
  { name: 'Pão sírio', per: 1, unit: 'unid', kcal: 170, protein: 6, carb: 33, fat: 1.5, gramsPerUnit: 60 },
  { name: 'Pão de queijo', per: 1, unit: 'unid', kcal: 100, protein: 2, carb: 12, fat: 5, gramsPerUnit: 30 },
  { name: 'Torrada integral', per: 1, unit: 'unid', kcal: 20, protein: 0.6, carb: 4, fat: 0.2, gramsPerUnit: 5 },
  { name: 'Biscoito de arroz', per: 1, unit: 'unid', kcal: 35, protein: 0.7, carb: 7.5, fat: 0.3, gramsPerUnit: 9 },
  { name: 'Lombo suíno grelhado', per: 100, unit: 'g', kcal: 143, protein: 26, carb: 0, fat: 4 },
  { name: 'Camarão cozido', per: 100, unit: 'g', kcal: 99, protein: 24, carb: 0.2, fat: 0.3 },
  { name: 'Linguiça de frango', per: 100, unit: 'g', kcal: 170, protein: 16, carb: 2, fat: 11 },
  { name: 'Peito de peru fatiado', per: 100, unit: 'g', kcal: 100, protein: 17, carb: 2, fat: 3 },
  { name: 'Tofu', per: 100, unit: 'g', kcal: 76, protein: 8, carb: 2, fat: 4.8 },
  { name: 'Grão de bico cozido', per: 100, unit: 'g', kcal: 164, protein: 8.9, carb: 27, fat: 2.6 },
  { name: 'Lentilha cozida', per: 100, unit: 'g', kcal: 116, protein: 9, carb: 20, fat: 0.4 },
  { name: 'Milho cozido', per: 100, unit: 'g', kcal: 96, protein: 3.4, carb: 21, fat: 1.5 },
  { name: 'Inhame cozido', per: 100, unit: 'g', kcal: 118, protein: 2, carb: 27.6, fat: 0.2 },
  { name: 'Granola sem açúcar', per: 100, unit: 'g', kcal: 450, protein: 10, carb: 64, fat: 15 },
  { name: 'Farinha de mandioca', per: 1, unit: 'colher sopa', kcal: 35, protein: 0.2, carb: 8.4, fat: 0.1 },
  { name: 'Pepino', per: 100, unit: 'g', kcal: 15, protein: 0.7, carb: 3.6, fat: 0.1 },
  { name: 'Pimentão', per: 100, unit: 'g', kcal: 31, protein: 1, carb: 6, fat: 0.3 },
  { name: 'Couve refogada', per: 100, unit: 'g', kcal: 44, protein: 2.9, carb: 4.3, fat: 1.7 },
  { name: 'Beterraba cozida', per: 100, unit: 'g', kcal: 44, protein: 1.7, carb: 10, fat: 0.2 },
  { name: 'Abacaxi', per: 100, unit: 'g', kcal: 50, protein: 0.5, carb: 13, fat: 0.1 },
  { name: 'Melancia', per: 100, unit: 'g', kcal: 30, protein: 0.6, carb: 8, fat: 0.2 },
  { name: 'Uva', per: 100, unit: 'g', kcal: 69, protein: 0.7, carb: 18, fat: 0.2 },
  { name: 'Manga', per: 100, unit: 'g', kcal: 60, protein: 0.8, carb: 15, fat: 0.4 },
  { name: 'Leite desnatado', per: 100, unit: 'ml', kcal: 35, protein: 3.4, carb: 5, fat: 0.2 },
  { name: 'Leite integral', per: 100, unit: 'ml', kcal: 61, protein: 3.2, carb: 4.8, fat: 3.3 },
  { name: 'Achocolatado em pó', per: 1, unit: 'colher sopa', kcal: 40, protein: 0.5, carb: 9, fat: 0.4 },
  { name: 'Mel', per: 1, unit: 'colher sopa', kcal: 64, protein: 0.1, carb: 17, fat: 0 },
  { name: 'Picanha grelhada', per: 100, unit: 'g', kcal: 220, protein: 26, carb: 0, fat: 12 },
  { name: 'Tomahawk (costela grelhada)', per: 100, unit: 'g', kcal: 280, protein: 24, carb: 0, fat: 20 },
  { name: 'Fraldinha grelhada', per: 100, unit: 'g', kcal: 195, protein: 27, carb: 0, fat: 9 },
  { name: 'Costela bovina assada', per: 100, unit: 'g', kcal: 270, protein: 23, carb: 0, fat: 19 },
  { name: 'Alcatra grelhada', per: 100, unit: 'g', kcal: 163, protein: 27, carb: 0, fat: 5.5 },
  { name: 'Maminha grelhada', per: 100, unit: 'g', kcal: 170, protein: 26, carb: 0, fat: 7 },
  { name: 'Contra-filé grelhado', per: 100, unit: 'g', kcal: 195, protein: 27, carb: 0, fat: 9 },
  { name: 'Cupim assado', per: 100, unit: 'g', kcal: 250, protein: 22, carb: 0, fat: 18 },
  { name: 'Linguiça toscana grelhada', per: 100, unit: 'g', kcal: 280, protein: 15, carb: 2, fat: 24 },
  { name: 'Frango a passarinho (frito)', per: 100, unit: 'g', kcal: 260, protein: 22, carb: 8, fat: 16 },
  { name: 'Coração de galinha grelhado', per: 100, unit: 'g', kcal: 180, protein: 20, carb: 0, fat: 11 },
  { name: 'Pão de alho', per: 1, unit: 'unid', kcal: 150, protein: 3, carb: 18, fat: 7 },
  { name: 'Espaguete à carbonara', per: 100, unit: 'g', kcal: 177, protein: 6.9, carb: 19, fat: 7.4 },
  { name: 'Espaguete ao molho bolonhesa', per: 100, unit: 'g', kcal: 150, protein: 7, carb: 20, fat: 4.5 },
  { name: 'Lasanha à bolonhesa', per: 100, unit: 'g', kcal: 175, protein: 9, carb: 15, fat: 9 },
  { name: 'Nhoque ao sugo', per: 100, unit: 'g', kcal: 140, protein: 3.5, carb: 26, fat: 2 },
  { name: 'Fettuccine Alfredo', per: 100, unit: 'g', kcal: 195, protein: 6, carb: 20, fat: 10 },
  { name: 'Ravioli de queijo ao molho', per: 100, unit: 'g', kcal: 170, protein: 7, carb: 22, fat: 6 },
  { name: 'Penne ao molho branco', per: 100, unit: 'g', kcal: 165, protein: 5.5, carb: 21, fat: 6.5 },
  { name: 'Yakisoba (carne e legumes)', per: 100, unit: 'g', kcal: 120, protein: 6, carb: 15, fat: 4 },
  { name: 'Feijoada (porção completa)', per: 100, unit: 'g', kcal: 160, protein: 11, carb: 12, fat: 8 },
  { name: 'Strogonoff de carne', per: 100, unit: 'g', kcal: 190, protein: 12, carb: 8, fat: 12 },
  { name: 'Strogonoff de frango', per: 100, unit: 'g', kcal: 160, protein: 13, carb: 7, fat: 9 },
  { name: 'Moqueca de peixe', per: 100, unit: 'g', kcal: 140, protein: 14, carb: 4, fat: 8 },
  { name: 'Bobó de camarão', per: 100, unit: 'g', kcal: 155, protein: 9, carb: 14, fat: 7 },
  { name: 'Escondidinho de carne seca', per: 100, unit: 'g', kcal: 175, protein: 9, carb: 17, fat: 8 },
  { name: 'Baião de dois', per: 100, unit: 'g', kcal: 150, protein: 7, carb: 22, fat: 4 },
  { name: 'Virado à paulista', per: 100, unit: 'g', kcal: 165, protein: 8, carb: 18, fat: 6.5 },
  { name: 'Picadinho de carne com legumes', per: 100, unit: 'g', kcal: 140, protein: 13, carb: 8, fat: 6 },
  { name: 'Farofa', per: 100, unit: 'g', kcal: 365, protein: 2, carb: 55, fat: 14 },
  { name: 'Arroz à grega', per: 100, unit: 'g', kcal: 140, protein: 3, carb: 24, fat: 3.5 },
  { name: 'Feijão tropeiro', per: 100, unit: 'g', kcal: 200, protein: 9, carb: 18, fat: 10 },
  { name: 'Hambúrguer artesanal (com pão)', per: 1, unit: 'unid', kcal: 550, protein: 28, carb: 40, fat: 30 },
  { name: 'X-salada', per: 1, unit: 'unid', kcal: 480, protein: 24, carb: 38, fat: 25 },
  { name: 'Pizza mussarela (fatia)', per: 1, unit: 'fatia', kcal: 265, protein: 11, carb: 33, fat: 10 },
  { name: 'Pizza calabresa (fatia)', per: 1, unit: 'fatia', kcal: 280, protein: 12, carb: 32, fat: 12 },
  { name: 'Batata frita (porção média)', per: 1, unit: 'porção', kcal: 365, protein: 4, carb: 48, fat: 17 },
  { name: 'Nuggets de frango (6 unid)', per: 1, unit: 'porção', kcal: 280, protein: 14, carb: 18, fat: 17 },
  { name: 'Cachorro-quente completo', per: 1, unit: 'unid', kcal: 380, protein: 14, carb: 35, fat: 20 },
  { name: 'Sushi salmão (1 peça)', per: 1, unit: 'peça', kcal: 45, protein: 3, carb: 7, fat: 0.7 },
  { name: 'Sashimi de salmão (1 fatia)', per: 1, unit: 'fatia', kcal: 40, protein: 5, carb: 0, fat: 2 },
  { name: 'Temaki de salmão', per: 1, unit: 'unid', kcal: 280, protein: 12, carb: 40, fat: 8 },
  { name: 'Coxinha de frango', per: 1, unit: 'unid', kcal: 220, protein: 8, carb: 22, fat: 11 },
  { name: 'Pastel de carne', per: 1, unit: 'unid', kcal: 290, protein: 9, carb: 28, fat: 16 },
  { name: 'Pastel de queijo', per: 1, unit: 'unid', kcal: 270, protein: 8, carb: 27, fat: 15 },
  { name: 'Empada de frango', per: 1, unit: 'unid', kcal: 230, protein: 6, carb: 20, fat: 14 },
  { name: 'Esfiha de carne', per: 1, unit: 'unid', kcal: 180, protein: 7, carb: 20, fat: 8 },
  { name: 'Risole de camarão', per: 1, unit: 'unid', kcal: 150, protein: 5, carb: 14, fat: 8 },
  { name: 'Bolinho de bacalhau', per: 1, unit: 'unid', kcal: 90, protein: 5, carb: 7, fat: 5 },
  { name: 'Pão de mel', per: 1, unit: 'unid', kcal: 180, protein: 2, carb: 32, fat: 5 },
  { name: 'Brigadeiro', per: 1, unit: 'unid', kcal: 90, protein: 1, carb: 12, fat: 4 },
  { name: 'Bolo de chocolate (fatia)', per: 1, unit: 'fatia', kcal: 300, protein: 4, carb: 42, fat: 13 },
  { name: 'Pudim (fatia)', per: 1, unit: 'fatia', kcal: 200, protein: 4, carb: 32, fat: 6 },
  { name: 'Sorvete (1 bola)', per: 1, unit: 'bola', kcal: 140, protein: 2, carb: 18, fat: 7 },
  { name: 'Mousse de chocolate', per: 1, unit: 'porção', kcal: 220, protein: 3, carb: 22, fat: 14 },
  { name: 'Petit gâteau', per: 1, unit: 'unid', kcal: 380, protein: 5, carb: 45, fat: 20 },
  { name: 'Refrigerante (lata)', per: 1, unit: 'lata', kcal: 150, protein: 0, carb: 39, fat: 0 },
  { name: 'Suco de laranja natural (copo)', per: 1, unit: 'copo', kcal: 130, protein: 2, carb: 30, fat: 0.5 },
  { name: 'Cerveja (lata/long neck)', per: 1, unit: 'lata', kcal: 150, protein: 1.5, carb: 12, fat: 0 },
  { name: 'Vinho tinto (taça)', per: 1, unit: 'taça', kcal: 125, protein: 0.1, carb: 4, fat: 0 },
  { name: 'Água de coco (copo)', per: 1, unit: 'copo', kcal: 60, protein: 0, carb: 14, fat: 0 },
  { name: 'Café com leite (xícara)', per: 1, unit: 'xícara', kcal: 60, protein: 3, carb: 6, fat: 2.5 },
  { name: 'Caipirinha', per: 1, unit: 'dose', kcal: 200, protein: 0, carb: 22, fat: 0 },
  { name: 'Molho de tomate', per: 1, unit: 'colher sopa', kcal: 15, protein: 0.4, carb: 3, fat: 0.1 },
  { name: 'Molho branco (bechamel)', per: 1, unit: 'colher sopa', kcal: 40, protein: 1, carb: 2, fat: 3 },
  { name: 'Maionese', per: 1, unit: 'colher sopa', kcal: 95, protein: 0.1, carb: 0.4, fat: 10.5 },
  { name: 'Ketchup', per: 1, unit: 'colher sopa', kcal: 20, protein: 0.2, carb: 5, fat: 0 },
  { name: 'Molho shoyu', per: 1, unit: 'colher sopa', kcal: 10, protein: 1, carb: 1.5, fat: 0 },
  { name: 'Manteiga', per: 1, unit: 'colher sopa', kcal: 100, protein: 0.1, carb: 0, fat: 11.5 },
  { name: 'Cream cheese', per: 1, unit: 'colher sopa', kcal: 50, protein: 1, carb: 0.5, fat: 5 },
  { name: 'Leite condensado', per: 1, unit: 'colher sopa', kcal: 60, protein: 1.5, carb: 10, fat: 1.5 },
  { name: 'Alface', per: 100, unit: 'g', kcal: 15, protein: 1.4, carb: 2.9, fat: 0.2 },
  { name: 'Rúcula', per: 100, unit: 'g', kcal: 25, protein: 2.6, carb: 3.7, fat: 0.7 },
  { name: 'Espinafre cru', per: 100, unit: 'g', kcal: 23, protein: 2.9, carb: 3.6, fat: 0.4 },
  { name: 'Espinafre refogado', per: 100, unit: 'g', kcal: 30, protein: 3.5, carb: 3, fat: 1.2 },
  { name: 'Couve crua', per: 100, unit: 'g', kcal: 27, protein: 1.9, carb: 4.3, fat: 0.4 },
  { name: 'Agrião', per: 100, unit: 'g', kcal: 11, protein: 1.7, carb: 1.3, fat: 0.2 },
  { name: 'Acelga', per: 100, unit: 'g', kcal: 19, protein: 1.8, carb: 3.7, fat: 0.2 },
  { name: 'Repolho cru', per: 100, unit: 'g', kcal: 25, protein: 1.3, carb: 5.8, fat: 0.1 },
  { name: 'Repolho refogado', per: 100, unit: 'g', kcal: 28, protein: 1.4, carb: 5, fat: 0.5 },
  { name: 'Chicória', per: 100, unit: 'g', kcal: 17, protein: 1.7, carb: 3.4, fat: 0.2 },
  { name: 'Almeirão', per: 100, unit: 'g', kcal: 15, protein: 1.6, carb: 2.9, fat: 0.2 },
  { name: 'Mostarda (folha)', per: 100, unit: 'g', kcal: 27, protein: 2.9, carb: 4.7, fat: 0.4 },
  { name: 'Berinjela', per: 100, unit: 'g', kcal: 25, protein: 1, carb: 6, fat: 0.2 },
  { name: 'Chuchu cozido', per: 100, unit: 'g', kcal: 19, protein: 0.8, carb: 4.3, fat: 0.1 },
  { name: 'Quiabo', per: 100, unit: 'g', kcal: 33, protein: 1.9, carb: 7.5, fat: 0.2 },
  { name: 'Couve-flor cozida', per: 100, unit: 'g', kcal: 25, protein: 1.9, carb: 5, fat: 0.3 },
  { name: 'Aspargo cozido', per: 100, unit: 'g', kcal: 22, protein: 2.4, carb: 4, fat: 0.2 },
  { name: 'Ervilha cozida', per: 100, unit: 'g', kcal: 81, protein: 5.4, carb: 14, fat: 0.4 },
  { name: 'Rabanete', per: 100, unit: 'g', kcal: 16, protein: 0.7, carb: 3.4, fat: 0.1 },
  { name: 'Nabo cozido', per: 100, unit: 'g', kcal: 22, protein: 0.9, carb: 5.1, fat: 0.1 },
  { name: 'Alho-poró', per: 100, unit: 'g', kcal: 31, protein: 1.5, carb: 7.3, fat: 0.2 },
  { name: 'Aipo/salsão', per: 100, unit: 'g', kcal: 16, protein: 0.7, carb: 3, fat: 0.2 },
  { name: 'Jiló', per: 100, unit: 'g', kcal: 32, protein: 1.4, carb: 7.6, fat: 0.2 },
  { name: 'Palmito', per: 100, unit: 'g', kcal: 26, protein: 2.2, carb: 4.6, fat: 0.4 },
  { name: 'Cogumelo Paris', per: 100, unit: 'g', kcal: 22, protein: 3.1, carb: 3.3, fat: 0.3 },
  { name: 'Shitake', per: 100, unit: 'g', kcal: 34, protein: 2.2, carb: 6.8, fat: 0.5 },
  { name: 'Abóbora cozida', per: 100, unit: 'g', kcal: 26, protein: 1, carb: 6.5, fat: 0.1 },
  { name: 'Centeio cozido', per: 100, unit: 'g', kcal: 83, protein: 3, carb: 18, fat: 0.7 },
  { name: 'Cevada cozida', per: 100, unit: 'g', kcal: 123, protein: 2.3, carb: 28, fat: 0.4 },
  { name: 'Trigo sarraceno cozido', per: 100, unit: 'g', kcal: 92, protein: 3.4, carb: 20, fat: 0.6 },
  { name: 'Painço/milheto cozido', per: 100, unit: 'g', kcal: 119, protein: 3.5, carb: 23, fat: 1 },
  { name: 'Amaranto cozido', per: 100, unit: 'g', kcal: 102, protein: 3.8, carb: 19, fat: 1.6 },
  { name: 'Muesli', per: 100, unit: 'g', kcal: 340, protein: 10, carb: 66, fat: 6 },
  { name: 'Arroz basmati cozido', per: 100, unit: 'g', kcal: 121, protein: 2.7, carb: 25, fat: 0.4 },
  { name: 'Arroz arbóreo (risoto) cozido', per: 100, unit: 'g', kcal: 130, protein: 2.5, carb: 28, fat: 0.3 },
  { name: 'Canjica/cevadinha', per: 100, unit: 'g', kcal: 90, protein: 2, carb: 19, fat: 0.5 },
  { name: 'Trigo em grão cozido', per: 100, unit: 'g', kcal: 83, protein: 3.4, carb: 17, fat: 0.6 },
  { name: 'Peito de peru assado', per: 100, unit: 'g', kcal: 135, protein: 30, carb: 0, fat: 1.5 },
  { name: 'Coxa de frango assada (com pele)', per: 100, unit: 'g', kcal: 215, protein: 26, carb: 0, fat: 11 },
  { name: 'Coxa de frango sem pele', per: 100, unit: 'g', kcal: 172, protein: 28, carb: 0, fat: 6 },
  { name: 'Sobrecoxa de frango', per: 100, unit: 'g', kcal: 200, protein: 25, carb: 0, fat: 10 },
  { name: 'Bisteca suína grelhada', per: 100, unit: 'g', kcal: 195, protein: 27, carb: 0, fat: 9 },
  { name: 'Pernil suíno assado', per: 100, unit: 'g', kcal: 215, protein: 26, carb: 0, fat: 11 },
  { name: 'Bacon frito', per: 100, unit: 'g', kcal: 541, protein: 37, carb: 1.4, fat: 42 },
  { name: 'Carne de sol', per: 100, unit: 'g', kcal: 215, protein: 30, carb: 0, fat: 10 },
  { name: 'Charque/carne seca', per: 100, unit: 'g', kcal: 250, protein: 35, carb: 0, fat: 11 },
  { name: 'Cordeiro grelhado', per: 100, unit: 'g', kcal: 235, protein: 25, carb: 0, fat: 15 },
  { name: 'Pato assado', per: 100, unit: 'g', kcal: 240, protein: 20, carb: 0, fat: 17 },
  { name: 'Coelho assado', per: 100, unit: 'g', kcal: 173, protein: 29, carb: 0, fat: 6 },
  { name: 'Fígado bovino grelhado', per: 100, unit: 'g', kcal: 175, protein: 26, carb: 4, fat: 5 },
  { name: 'Língua bovina cozida', per: 100, unit: 'g', kcal: 224, protein: 19, carb: 0, fat: 16 },
  { name: 'Mortadela', per: 100, unit: 'g', kcal: 269, protein: 14, carb: 4, fat: 22 },
  { name: 'Salame', per: 100, unit: 'g', kcal: 336, protein: 22, carb: 1.5, fat: 27 },
  { name: 'Presunto cozido', per: 100, unit: 'g', kcal: 145, protein: 18, carb: 2, fat: 7.5 },
  { name: 'Merluza grelhada', per: 100, unit: 'g', kcal: 90, protein: 18, carb: 0, fat: 1.8 },
  { name: 'Bacalhau dessalgado cozido', per: 100, unit: 'g', kcal: 82, protein: 18, carb: 0, fat: 0.7 },
  { name: 'Sardinha grelhada', per: 100, unit: 'g', kcal: 170, protein: 21, carb: 0, fat: 9 },
  { name: 'Polvo cozido', per: 100, unit: 'g', kcal: 82, protein: 15, carb: 2.2, fat: 1 },
  { name: 'Lula grelhada', per: 100, unit: 'g', kcal: 92, protein: 16, carb: 3.1, fat: 1.4 },
  { name: 'Mexilhão cozido', per: 100, unit: 'g', kcal: 86, protein: 12, carb: 3.7, fat: 2.2 },
];

/**
 * EXTRA block — Carnes bovinas, suínas, aves e embutidos.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_CARNES_BOVINAS_SUINAS_AVES_E_EMBUTIDOS: FoodDbItem[] = [
  { name: 'Filé mignon grelhado', per: 100, unit: 'g', kcal: 220, protein: 32.8, carb: 0, fat: 8.8 },
  { name: 'Patinho grelhado', per: 100, unit: 'g', kcal: 219, protein: 35.9, carb: 0, fat: 7.3 },
  { name: 'Coxão mole cozido', per: 100, unit: 'g', kcal: 219, protein: 32.4, carb: 0, fat: 8.9 },
  { name: 'Coxão duro cozido', per: 100, unit: 'g', kcal: 217, protein: 31.9, carb: 0, fat: 8.8 },
  { name: 'Lagarto cozido', per: 100, unit: 'g', kcal: 222, protein: 32.7, carb: 0, fat: 9 },
  { name: 'Acém moído refogado', per: 100, unit: 'g', kcal: 212, protein: 26.7, carb: 0, fat: 10.9 },
  { name: 'Carne moída (patinho) refogada', per: 100, unit: 'g', kcal: 200, protein: 32, carb: 0, fat: 7 },
  { name: 'Hambúrguer bovino grelhado', per: 100, unit: 'g', kcal: 250, protein: 26, carb: 0, fat: 16 },
  { name: 'Bife acebolado', per: 100, unit: 'g', kcal: 190, protein: 26, carb: 3, fat: 8 },
  { name: 'Bife à milanesa (frito)', per: 100, unit: 'g', kcal: 250, protein: 18, carb: 14, fat: 14 },
  { name: 'Rabada cozida', per: 100, unit: 'g', kcal: 250, protein: 28, carb: 0, fat: 15 },
  { name: 'Fígado de frango refogado', per: 100, unit: 'g', kcal: 160, protein: 24, carb: 1, fat: 6.5 },
  { name: 'Moela de frango cozida', per: 100, unit: 'g', kcal: 155, protein: 29, carb: 0, fat: 3.5 },
  { name: 'Costelinha suína assada', per: 100, unit: 'g', kcal: 294, protein: 24, carb: 0, fat: 22 },
  { name: 'Torresmo frito', per: 100, unit: 'g', kcal: 544, protein: 28, carb: 0, fat: 48 },
  { name: 'Linguiça calabresa frita', per: 100, unit: 'g', kcal: 336, protein: 18, carb: 3, fat: 28 },
  { name: 'Salsicha cozida', per: 100, unit: 'g', kcal: 247, protein: 11, carb: 3.5, fat: 21 },
  { name: 'Almôndega bovina ao molho', per: 100, unit: 'g', kcal: 196, protein: 14, carb: 8, fat: 12 },
  { name: 'Kibe assado', per: 100, unit: 'g', kcal: 225, protein: 16, carb: 20, fat: 9 },
  { name: 'Kibe frito', per: 1, unit: 'unid', kcal: 150, protein: 7, carb: 11, fat: 9, gramsPerUnit: 60 },
  { name: 'Peito de frango cozido', per: 100, unit: 'g', kcal: 163, protein: 31.5, carb: 0, fat: 3.2 },
  { name: 'Peito de frango com pele assado', per: 100, unit: 'g', kcal: 197, protein: 30, carb: 0, fat: 7.8 },
  { name: 'Peito de frango empanado frito', per: 100, unit: 'g', kcal: 254, protein: 20, carb: 12, fat: 14 },
  { name: 'Asa de frango assada', per: 100, unit: 'g', kcal: 222, protein: 24, carb: 0, fat: 14 },
  { name: 'Frango à parmegiana', per: 100, unit: 'g', kcal: 219, protein: 18, carb: 12, fat: 11 },
  { name: 'Frango xadrez', per: 100, unit: 'g', kcal: 143, protein: 13, carb: 7, fat: 7 },
  { name: 'Galinhada', per: 100, unit: 'g', kcal: 140, protein: 9, carb: 17, fat: 4 },
  { name: 'Frango com quiabo', per: 100, unit: 'g', kcal: 122, protein: 14, carb: 3, fat: 6 },
  { name: 'Peito de peru defumado', per: 100, unit: 'g', kcal: 104, protein: 18, carb: 2, fat: 2.5 },
  { name: 'Blanquet/presunto de peru', per: 100, unit: 'g', kcal: 90, protein: 15, carb: 2, fat: 2.5 },
  { name: 'Linguiça de frango grelhada', per: 100, unit: 'g', kcal: 190, protein: 17, carb: 1.5, fat: 13 },
  { name: 'Hambúrguer de frango grelhado', per: 100, unit: 'g', kcal: 180, protein: 19, carb: 6, fat: 9 },
  { name: 'Filé de frango grelhado (sassami)', per: 100, unit: 'g', kcal: 150, protein: 30, carb: 0, fat: 3 },
];

/**
 * EXTRA block — Ovos.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_OVOS: FoodDbItem[] = [
  { name: 'Ovo cozido', per: 1, unit: 'unid', kcal: 74, protein: 6.3, carb: 0.6, fat: 5.3, gramsPerUnit: 50 },
  { name: 'Ovo frito', per: 1, unit: 'unid', kcal: 88, protein: 6.3, carb: 0.4, fat: 6.8, gramsPerUnit: 46 },
  { name: 'Omelete simples (2 ovos)', per: 1, unit: 'unid', kcal: 154, protein: 10.5, carb: 1, fat: 12, gramsPerUnit: 100 },
  { name: 'Ovos mexidos', per: 100, unit: 'g', kcal: 165, protein: 10.5, carb: 1.6, fat: 13 },
  { name: 'Ovo de codorna', per: 1, unit: 'unid', kcal: 15, protein: 1.3, carb: 0.04, fat: 1.1, gramsPerUnit: 9 },
  { name: 'Gema de ovo', per: 1, unit: 'unid', kcal: 54, protein: 2.7, carb: 0.6, fat: 4.5, gramsPerUnit: 17 },
  { name: 'Clara de ovo cozida', per: 100, unit: 'g', kcal: 52, protein: 11, carb: 0.7, fat: 0.2 },
];

/**
 * EXTRA block — Peixes e frutos do mar.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_PEIXES_E_FRUTOS_DO_MAR: FoodDbItem[] = [
  { name: 'Atum fresco grelhado', per: 100, unit: 'g', kcal: 174, protein: 30, carb: 0, fat: 6 },
  { name: 'Atum em lata (óleo), escorrido', per: 100, unit: 'g', kcal: 180, protein: 27, carb: 0, fat: 8 },
  { name: 'Sardinha em lata (óleo), escorrida', per: 100, unit: 'g', kcal: 203, protein: 25, carb: 0, fat: 11.5 },
  { name: 'Salmão grelhado', per: 100, unit: 'g', kcal: 226, protein: 25, carb: 0, fat: 14 },
  { name: 'Salmão defumado', per: 100, unit: 'g', kcal: 111, protein: 18, carb: 0, fat: 4.3 },
  { name: 'Pescada cozida', per: 100, unit: 'g', kcal: 106, protein: 21, carb: 0, fat: 2.4 },
  { name: 'Filé de peixe empanado frito', per: 100, unit: 'g', kcal: 241, protein: 14, carb: 17, fat: 13 },
  { name: 'Truta grelhada', per: 100, unit: 'g', kcal: 164, protein: 24, carb: 0, fat: 7.5 },
  { name: 'Peixe frito (posta)', per: 100, unit: 'g', kcal: 220, protein: 22, carb: 5, fat: 12 },
  { name: 'Camarão ao alho e óleo', per: 100, unit: 'g', kcal: 129, protein: 20, carb: 1, fat: 5 },
  { name: 'Camarão empanado frito', per: 100, unit: 'g', kcal: 250, protein: 17, carb: 17, fat: 14 },
  { name: 'Caranguejo cozido', per: 100, unit: 'g', kcal: 97, protein: 19, carb: 0, fat: 1.5 },
  { name: 'Ostra crua', per: 100, unit: 'g', kcal: 66, protein: 7, carb: 4, fat: 2.5 },
  { name: 'Bacalhau à Gomes de Sá', per: 100, unit: 'g', kcal: 139, protein: 9, carb: 10, fat: 7 },
  { name: 'Kani (surimi)', per: 100, unit: 'g', kcal: 75, protein: 7, carb: 8.5, fat: 0.7 },
  { name: 'Sushi (uramaki, 1 peça)', per: 1, unit: 'peça', kcal: 38, protein: 1.5, carb: 6.5, fat: 0.8 },
  { name: 'Hossomaki de pepino (1 peça)', per: 1, unit: 'peça', kcal: 30, protein: 0.7, carb: 6.5, fat: 0.1 },
  { name: 'Joe de salmão (1 peça)', per: 1, unit: 'peça', kcal: 55, protein: 3, carb: 6, fat: 2.2 },
];

/**
 * EXTRA block — Laticínios e queijos.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_LATICINIOS_E_QUEIJOS: FoodDbItem[] = [
  { name: 'Queijo mussarela', per: 100, unit: 'g', kcal: 305, protein: 22, carb: 2.5, fat: 23 },
  { name: 'Queijo prato', per: 100, unit: 'g', kcal: 357, protein: 22, carb: 2, fat: 29 },
  { name: 'Queijo parmesão ralado', per: 100, unit: 'g', kcal: 417, protein: 36, carb: 3, fat: 29 },
  { name: 'Queijo parmesão ralado (colher sopa)', per: 1, unit: 'colher sopa', kcal: 21, protein: 1.8, carb: 0.2, fat: 1.4, gramsPerUnit: 5 },
  { name: 'Requeijão cremoso', per: 1, unit: 'colher sopa', kcal: 73, protein: 2.7, carb: 1, fat: 6.5, gramsPerUnit: 30 },
  { name: 'Ricota', per: 100, unit: 'g', kcal: 141, protein: 12, carb: 3, fat: 9 },
  { name: 'Queijo coalho grelhado', per: 100, unit: 'g', kcal: 325, protein: 22, carb: 3, fat: 25 },
  { name: 'Queijo provolone', per: 100, unit: 'g', kcal: 351, protein: 25, carb: 2, fat: 27 },
  { name: 'Queijo gorgonzola', per: 100, unit: 'g', kcal: 353, protein: 21, carb: 2, fat: 29 },
  { name: 'Queijo minas padrão', per: 100, unit: 'g', kcal: 330, protein: 21, carb: 2, fat: 26 },
  { name: 'Queijo cheddar', per: 100, unit: 'g', kcal: 402, protein: 25, carb: 1.3, fat: 33 },
  { name: 'Queijo mussarela (fatia)', per: 1, unit: 'fatia', kcal: 60, protein: 4.5, carb: 0.5, fat: 4.6, gramsPerUnit: 20 },
  { name: 'Queijo prato (fatia)', per: 1, unit: 'fatia', kcal: 72, protein: 4.5, carb: 0.4, fat: 5.8, gramsPerUnit: 20 },
  { name: 'Leite em pó integral (colher sopa)', per: 1, unit: 'colher sopa', kcal: 48, protein: 2.6, carb: 3.8, fat: 2.6, gramsPerUnit: 10 },
  { name: 'Leite semidesnatado', per: 100, unit: 'ml', kcal: 46, protein: 3.3, carb: 4.8, fat: 1.6 },
  { name: 'Leite de soja', per: 100, unit: 'ml', kcal: 45, protein: 3.3, carb: 4, fat: 1.8 },
  { name: 'Leite de amêndoas sem açúcar', per: 100, unit: 'ml', kcal: 15, protein: 0.6, carb: 0.6, fat: 1.1 },
  { name: 'Leite de coco', per: 100, unit: 'ml', kcal: 208, protein: 2, carb: 3, fat: 20.9 },
  { name: 'Leite de aveia', per: 100, unit: 'ml', kcal: 43, protein: 1, carb: 6.5, fat: 1.5 },
  { name: 'Iogurte natural integral', per: 100, unit: 'g', kcal: 63, protein: 3.5, carb: 4.7, fat: 3.3 },
  { name: 'Iogurte com frutas', per: 100, unit: 'g', kcal: 92, protein: 3, carb: 16, fat: 1.8 },
  { name: 'Iogurte proteico/skyr', per: 100, unit: 'g', kcal: 63, protein: 11, carb: 4, fat: 0.2 },
  { name: 'Coalhada', per: 100, unit: 'g', kcal: 67, protein: 4, carb: 5, fat: 3.5 },
  { name: 'Kefir de leite', per: 100, unit: 'ml', kcal: 58, protein: 3.3, carb: 4.5, fat: 3 },
  { name: 'Creme de leite (colher sopa)', per: 1, unit: 'colher sopa', kcal: 35, protein: 0.4, carb: 0.6, fat: 3.5, gramsPerUnit: 15 },
  { name: 'Margarina', per: 1, unit: 'colher sopa', kcal: 72, protein: 0, carb: 0, fat: 8, gramsPerUnit: 10 },
  { name: 'Ghee/manteiga clarificada', per: 1, unit: 'colher sopa', kcal: 117, protein: 0, carb: 0, fat: 13, gramsPerUnit: 13 },
  { name: 'Doce de leite', per: 1, unit: 'colher sopa', kcal: 62, protein: 1, carb: 10, fat: 2, gramsPerUnit: 20 },
  { name: 'Chantilly', per: 1, unit: 'colher sopa', kcal: 40, protein: 0.3, carb: 2.5, fat: 3.2, gramsPerUnit: 15 },
  { name: 'Leite fermentado (Yakult)', per: 1, unit: 'unid', kcal: 52, protein: 1, carb: 12, fat: 0.1, gramsPerUnit: 80 },
];

/**
 * EXTRA block — Pães, biscoitos e massas de café da manhã.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_PAES_BISCOITOS_E_MASSAS_DE_CAFE_DA_MANHA: FoodDbItem[] = [
  { name: 'Pão de hot dog', per: 1, unit: 'unid', kcal: 140, protein: 4.5, carb: 26, fat: 2, gramsPerUnit: 50 },
  { name: 'Pão de hambúrguer', per: 1, unit: 'unid', kcal: 168, protein: 5.5, carb: 31, fat: 2.5, gramsPerUnit: 60 },
  { name: 'Pão ciabatta', per: 1, unit: 'unid', kcal: 157, protein: 5, carb: 31, fat: 1.5, gramsPerUnit: 60 },
  { name: 'Baguete (fatia)', per: 1, unit: 'fatia', kcal: 80, protein: 2.7, carb: 16, fat: 0.6, gramsPerUnit: 30 },
  { name: 'Pão de centeio (fatia)', per: 1, unit: 'fatia', kcal: 79, protein: 2.5, carb: 15, fat: 1, gramsPerUnit: 30 },
  { name: 'Pão naan', per: 1, unit: 'unid', kcal: 261, protein: 8.7, carb: 45, fat: 5.1, gramsPerUnit: 90 },
  { name: 'Tortilha de trigo/wrap', per: 1, unit: 'unid', kcal: 139, protein: 3.8, carb: 24, fat: 3.1, gramsPerUnit: 45 },
  { name: 'Croissant', per: 1, unit: 'unid', kcal: 235, protein: 4.7, carb: 27, fat: 12, gramsPerUnit: 60 },
  { name: 'Broa de milho', per: 1, unit: 'unid', kcal: 138, protein: 3, carb: 27, fat: 2, gramsPerUnit: 50 },
  { name: 'Bisnaguinha', per: 1, unit: 'unid', kcal: 70, protein: 2, carb: 12.5, fat: 1.3, gramsPerUnit: 25 },
  { name: 'Torrada tradicional', per: 1, unit: 'unid', kcal: 30, protein: 0.8, carb: 5.7, fat: 0.5, gramsPerUnit: 8 },
  { name: 'Biscoito cream cracker', per: 1, unit: 'unid', kcal: 25, protein: 0.6, carb: 4, fat: 0.8, gramsPerUnit: 6 },
  { name: 'Biscoito maisena', per: 1, unit: 'unid', kcal: 24, protein: 0.5, carb: 4.5, fat: 0.6, gramsPerUnit: 6 },
  { name: 'Biscoito recheado', per: 1, unit: 'unid', kcal: 74, protein: 0.8, carb: 10.5, fat: 3.2, gramsPerUnit: 15 },
  { name: 'Cookie', per: 1, unit: 'unid', kcal: 140, protein: 1.5, carb: 19, fat: 6.5, gramsPerUnit: 30 },
  { name: 'Bolo simples (fatia)', per: 1, unit: 'fatia', kcal: 190, protein: 3, carb: 30, fat: 6.5, gramsPerUnit: 60 },
  { name: 'Bolo de cenoura com cobertura (fatia)', per: 1, unit: 'fatia', kcal: 331, protein: 4, carb: 45, fat: 15, gramsPerUnit: 90 },
  { name: 'Pão com manteiga', per: 1, unit: 'unid', kcal: 236, protein: 4, carb: 28, fat: 12, gramsPerUnit: 60 },
  { name: 'Misto-quente', per: 1, unit: 'unid', kcal: 341, protein: 15, carb: 32, fat: 17 },
  { name: 'Sanduíche natural de frango', per: 1, unit: 'unid', kcal: 285, protein: 16, carb: 35, fat: 9 },
  { name: 'Sanduíche de peito de peru e queijo branco', per: 1, unit: 'unid', kcal: 248, protein: 16, carb: 28, fat: 8 },
  { name: 'Wrap de frango', per: 1, unit: 'unid', kcal: 306, protein: 24, carb: 30, fat: 10 },
  { name: 'Panqueca simples', per: 1, unit: 'unid', kcal: 99, protein: 3, carb: 14, fat: 3.5, gramsPerUnit: 50 },
  { name: 'Panqueca de aveia', per: 1, unit: 'unid', kcal: 89, protein: 4.5, carb: 10, fat: 3.5 },
  { name: 'Crepioca', per: 1, unit: 'unid', kcal: 146, protein: 7, carb: 17, fat: 5.5 },
  { name: 'Tapioca com queijo', per: 1, unit: 'unid', kcal: 198, protein: 6, carb: 30, fat: 6 },
  { name: 'Tapioca seca (goma)', per: 100, unit: 'g', kcal: 348, protein: 0.1, carb: 87, fat: 0 },
  { name: 'Flocão de milho (cru)', per: 100, unit: 'g', kcal: 355, protein: 7.5, carb: 78, fat: 1.5 },
  { name: 'Fubá/farinha de milho', per: 100, unit: 'g', kcal: 360, protein: 7, carb: 79, fat: 1.5 },
  { name: 'Farinha de trigo', per: 100, unit: 'g', kcal: 349, protein: 10, carb: 75, fat: 1 },
  { name: 'Cereal matinal açucarado', per: 100, unit: 'g', kcal: 377, protein: 5, carb: 88, fat: 0.5 },
  { name: 'Mingau de aveia (porção 200 g)', per: 1, unit: 'porção', kcal: 214, protein: 9, carb: 32, fat: 5.5, gramsPerUnit: 200 },
];

/**
 * EXTRA block — Arroz, feijões, massas e tubérculos.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_ARROZ_FEIJOES_MASSAS_E_TUBERCULOS: FoodDbItem[] = [
  { name: 'Feijão preto cozido', per: 100, unit: 'g', kcal: 78, protein: 4.5, carb: 14, fat: 0.5 },
  { name: 'Feijão carioca cozido', per: 100, unit: 'g', kcal: 76, protein: 4.8, carb: 13.6, fat: 0.5 },
  { name: 'Feijão branco cozido', per: 100, unit: 'g', kcal: 143, protein: 9.7, carb: 25, fat: 0.5 },
  { name: 'Feijão fradinho cozido', per: 100, unit: 'g', kcal: 119, protein: 7.7, carb: 21, fat: 0.5 },
  { name: 'Ervilha seca cozida', per: 100, unit: 'g', kcal: 121, protein: 8.3, carb: 21, fat: 0.4 },
  { name: 'Soja cozida', per: 100, unit: 'g', kcal: 173, protein: 17, carb: 10, fat: 9 },
  { name: 'Edamame cozido', per: 100, unit: 'g', kcal: 121, protein: 12, carb: 9, fat: 5 },
  { name: 'Arroz parboilizado cozido', per: 100, unit: 'g', kcal: 123, protein: 2.5, carb: 26.5, fat: 0.2 },
  { name: 'Arroz carreteiro', per: 100, unit: 'g', kcal: 170, protein: 9, carb: 20, fat: 6 },
  { name: 'Risoto de frango', per: 100, unit: 'g', kcal: 148, protein: 7, carb: 20, fat: 4.5 },
  { name: 'Tutu de feijão', per: 100, unit: 'g', kcal: 130, protein: 5, carb: 13, fat: 6.5 },
  { name: 'Macarrão cozido (espaguete)', per: 100, unit: 'g', kcal: 150, protein: 5.5, carb: 30, fat: 0.9 },
  { name: 'Macarrão ao alho e óleo', per: 100, unit: 'g', kcal: 160, protein: 5, carb: 25, fat: 4.5 },
  { name: 'Macarrão ao molho de tomate', per: 100, unit: 'g', kcal: 132, protein: 4.5, carb: 24, fat: 2 },
  { name: 'Macarrão de arroz cozido', per: 100, unit: 'g', kcal: 109, protein: 0.9, carb: 25, fat: 0.2 },
  { name: 'Nhoque de batata cozido', per: 100, unit: 'g', kcal: 133, protein: 3.2, carb: 29, fat: 0.4 },
  { name: 'Miojo (pacote preparado)', per: 1, unit: 'pacote', kcal: 375, protein: 8, carb: 52, fat: 15 },
  { name: 'Cuscuz marroquino cozido', per: 100, unit: 'g', kcal: 109, protein: 3.8, carb: 23, fat: 0.2 },
  { name: 'Polenta cozida', per: 100, unit: 'g', kcal: 70, protein: 1.5, carb: 15, fat: 0.4 },
  { name: 'Polenta frita', per: 100, unit: 'g', kcal: 184, protein: 3, carb: 25, fat: 8 },
  { name: 'Batata inglesa assada', per: 100, unit: 'g', kcal: 95, protein: 2.5, carb: 21, fat: 0.1 },
  { name: 'Purê de batata', per: 100, unit: 'g', kcal: 95, protein: 2, carb: 14, fat: 3.5 },
  { name: 'Batata sauté', per: 100, unit: 'g', kcal: 142, protein: 2.2, carb: 22, fat: 5 },
  { name: 'Batata rústica assada', per: 100, unit: 'g', kcal: 134, protein: 2.5, carb: 22, fat: 4 },
  { name: 'Batata frita (100 g)', per: 100, unit: 'g', kcal: 313, protein: 3.4, carb: 41, fat: 15 },
  { name: 'Batata-doce assada', per: 100, unit: 'g', kcal: 94, protein: 2, carb: 21, fat: 0.2 },
  { name: 'Mandioca frita', per: 100, unit: 'g', kcal: 300, protein: 1.5, carb: 42, fat: 14 },
  { name: 'Pipoca estourada (sem óleo)', per: 100, unit: 'g', kcal: 396, protein: 12, carb: 78, fat: 4 },
  { name: 'Pipoca estourada (xícara)', per: 1, unit: 'xícara', kcal: 33, protein: 1, carb: 6.2, fat: 0.4, gramsPerUnit: 8 },
  { name: 'Canja de galinha', per: 100, unit: 'g', kcal: 50, protein: 4, carb: 5, fat: 1.5 },
  { name: 'Caldo verde', per: 100, unit: 'g', kcal: 71, protein: 3, carb: 8, fat: 3 },
  { name: 'Sopa de legumes', per: 100, unit: 'g', kcal: 40, protein: 1.5, carb: 7, fat: 0.8 },
  { name: 'Sopa de feijão', per: 100, unit: 'g', kcal: 70, protein: 4, carb: 10, fat: 1.5 },
];

/**
 * EXTRA block — Frutas.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_FRUTAS: FoodDbItem[] = [
  { name: 'Banana-prata', per: 1, unit: 'unid', kcal: 59, protein: 0.8, carb: 15.6, fat: 0.1, gramsPerUnit: 60 },
  { name: 'Banana-nanica', per: 1, unit: 'unid', kcal: 83, protein: 1.3, carb: 21.4, fat: 0.1, gramsPerUnit: 90 },
  { name: 'Pera', per: 1, unit: 'unid', kcal: 74, protein: 0.8, carb: 19, fat: 0.2, gramsPerUnit: 140 },
  { name: 'Kiwi', per: 1, unit: 'unid', kcal: 46, protein: 0.8, carb: 11, fat: 0.4, gramsPerUnit: 75 },
  { name: 'Tangerina/mexerica', per: 1, unit: 'unid', kcal: 40, protein: 0.8, carb: 9.9, fat: 0.2, gramsPerUnit: 100 },
  { name: 'Ameixa fresca', per: 1, unit: 'unid', kcal: 30, protein: 0.5, carb: 7.5, fat: 0.2, gramsPerUnit: 66 },
  { name: 'Pêssego', per: 1, unit: 'unid', kcal: 59, protein: 1.4, carb: 14.5, fat: 0.4, gramsPerUnit: 150 },
  { name: 'Goiaba', per: 100, unit: 'g', kcal: 54, protein: 1.1, carb: 13, fat: 0.4 },
  { name: 'Melão', per: 100, unit: 'g', kcal: 30, protein: 0.7, carb: 7.5, fat: 0.1 },
  { name: 'Acerola', per: 100, unit: 'g', kcal: 33, protein: 0.9, carb: 8, fat: 0.2 },
  { name: 'Caqui', per: 100, unit: 'g', kcal: 71, protein: 0.4, carb: 19, fat: 0.1 },
  { name: 'Figo fresco', per: 100, unit: 'g', kcal: 74, protein: 0.8, carb: 19, fat: 0.3 },
  { name: 'Coco fresco', per: 100, unit: 'g', kcal: 354, protein: 3.3, carb: 15, fat: 33 },
  { name: 'Coco ralado seco sem açúcar', per: 100, unit: 'g', kcal: 660, protein: 7, carb: 24, fat: 65 },
  { name: 'Maracujá (polpa)', per: 100, unit: 'g', kcal: 68, protein: 2, carb: 12.3, fat: 2.1 },
  { name: 'Jabuticaba', per: 100, unit: 'g', kcal: 58, protein: 0.6, carb: 15, fat: 0.1 },
  { name: 'Caju', per: 100, unit: 'g', kcal: 43, protein: 1, carb: 10, fat: 0.3 },
  { name: 'Jaca', per: 100, unit: 'g', kcal: 88, protein: 1.4, carb: 22, fat: 0.3 },
  { name: 'Mirtilo', per: 100, unit: 'g', kcal: 57, protein: 0.7, carb: 14.5, fat: 0.3 },
  { name: 'Framboesa', per: 100, unit: 'g', kcal: 52, protein: 1.2, carb: 12, fat: 0.7 },
  { name: 'Uva-passa', per: 100, unit: 'g', kcal: 299, protein: 3.1, carb: 79, fat: 0.5 },
  { name: 'Tâmara', per: 1, unit: 'unid', kcal: 66, protein: 0.4, carb: 18, fat: 0, gramsPerUnit: 24 },
  { name: 'Damasco seco', per: 100, unit: 'g', kcal: 241, protein: 3.4, carb: 63, fat: 0.5 },
  { name: 'Ameixa seca', per: 100, unit: 'g', kcal: 240, protein: 2.2, carb: 64, fat: 0.4 },
  { name: 'Açaí polpa sem açúcar', per: 100, unit: 'g', kcal: 58, protein: 0.8, carb: 6.2, fat: 3.9 },
  { name: 'Açaí na tigela (300 g, com granola e banana)', per: 1, unit: 'porção', kcal: 484, protein: 5, carb: 80, fat: 16, gramsPerUnit: 300 },
  { name: 'Maçã (100 g)', per: 100, unit: 'g', kcal: 52, protein: 0.3, carb: 13.8, fat: 0.2 },
];

/**
 * EXTRA block — Verduras, legumes e conservas.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_VERDURAS_LEGUMES_E_CONSERVAS: FoodDbItem[] = [
  { name: 'Tomate', per: 100, unit: 'g', kcal: 21, protein: 0.9, carb: 3.9, fat: 0.2 },
  { name: 'Cebola', per: 100, unit: 'g', kcal: 42, protein: 1.1, carb: 9.3, fat: 0.1 },
  { name: 'Alho (dente)', per: 1, unit: 'unid', kcal: 4.8, protein: 0.2, carb: 1, fat: 0, gramsPerUnit: 3 },
  { name: 'Gengibre', per: 100, unit: 'g', kcal: 86, protein: 1.8, carb: 18, fat: 0.8 },
  { name: 'Milho verde enlatado', per: 100, unit: 'g', kcal: 87, protein: 2.5, carb: 17, fat: 1 },
  { name: 'Ervilha em lata', per: 100, unit: 'g', kcal: 70, protein: 4.5, carb: 12, fat: 0.4 },
  { name: 'Beterraba crua', per: 100, unit: 'g', kcal: 43, protein: 1.6, carb: 10, fat: 0.2 },
  { name: 'Repolho roxo', per: 100, unit: 'g', kcal: 33, protein: 1.4, carb: 7, fat: 0.2 },
  { name: 'Abóbora cabotiá cozida', per: 100, unit: 'g', kcal: 48, protein: 1.4, carb: 10.8, fat: 0.7 },
  { name: 'Brócolis cru', per: 100, unit: 'g', kcal: 34, protein: 2.8, carb: 6.6, fat: 0.4 },
  { name: 'Couve de Bruxelas cozida', per: 100, unit: 'g', kcal: 36, protein: 2.6, carb: 7, fat: 0.5 },
  { name: 'Azeitona verde', per: 100, unit: 'g', kcal: 145, protein: 1, carb: 3.8, fat: 15.3 },
  { name: 'Azeitona preta', per: 100, unit: 'g', kcal: 126, protein: 0.8, carb: 6, fat: 11 },
  { name: 'Picles de pepino', per: 100, unit: 'g', kcal: 11, protein: 0.3, carb: 2.3, fat: 0.2 },
  { name: 'Guacamole', per: 100, unit: 'g', kcal: 157, protein: 2, carb: 8, fat: 13 },
  { name: 'Homus', per: 100, unit: 'g', kcal: 174, protein: 8, carb: 14, fat: 9.6 },
  { name: 'Tahine', per: 1, unit: 'colher sopa', kcal: 95, protein: 2.6, carb: 3.2, fat: 8, gramsPerUnit: 15 },
  { name: 'Vinagrete', per: 100, unit: 'g', kcal: 45, protein: 0.8, carb: 5, fat: 2.5 },
  { name: 'Legumes salteados no azeite', per: 100, unit: 'g', kcal: 70, protein: 2, carb: 8, fat: 3.5 },
];

/**
 * EXTRA block — Castanhas, sementes, gorduras e molhos.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_CASTANHAS_SEMENTES_GORDURAS_E_MOLHOS: FoodDbItem[] = [
  { name: 'Castanha-do-pará', per: 1, unit: 'unid', kcal: 35, protein: 0.7, carb: 0.6, fat: 3.3, gramsPerUnit: 5 },
  { name: 'Castanha de caju', per: 100, unit: 'g', kcal: 588, protein: 18, carb: 30, fat: 44 },
  { name: 'Amendoim torrado', per: 100, unit: 'g', kcal: 630, protein: 24, carb: 21, fat: 50 },
  { name: 'Amêndoas', per: 100, unit: 'g', kcal: 622, protein: 21, carb: 22, fat: 50 },
  { name: 'Nozes', per: 100, unit: 'g', kcal: 701, protein: 15, carb: 14, fat: 65 },
  { name: 'Pistache', per: 100, unit: 'g', kcal: 597, protein: 20, carb: 28, fat: 45 },
  { name: 'Avelã', per: 100, unit: 'g', kcal: 677, protein: 15, carb: 17, fat: 61 },
  { name: 'Macadâmia', per: 100, unit: 'g', kcal: 772, protein: 8, carb: 14, fat: 76 },
  { name: 'Semente de chia', per: 1, unit: 'colher sopa', kcal: 61, protein: 2, carb: 5, fat: 3.7, gramsPerUnit: 12 },
  { name: 'Semente de linhaça', per: 1, unit: 'colher sopa', kcal: 57, protein: 1.8, carb: 2.9, fat: 4.2, gramsPerUnit: 10 },
  { name: 'Semente de girassol', per: 100, unit: 'g', kcal: 623, protein: 21, carb: 20, fat: 51 },
  { name: 'Semente de abóbora', per: 100, unit: 'g', kcal: 605, protein: 30, carb: 11, fat: 49 },
  { name: 'Gergelim', per: 100, unit: 'g', kcal: 614, protein: 18, carb: 23, fat: 50 },
  { name: 'Pasta de avelã com cacau', per: 1, unit: 'colher sopa', kcal: 109, protein: 1.2, carb: 11.7, fat: 6.3, gramsPerUnit: 20 },
  { name: 'Óleo de coco', per: 1, unit: 'colher sopa', kcal: 117, protein: 0, carb: 0, fat: 13, gramsPerUnit: 13 },
  { name: 'Óleo vegetal (soja/girassol)', per: 1, unit: 'colher sopa', kcal: 121, protein: 0, carb: 0, fat: 13.5, gramsPerUnit: 13 },
  { name: 'Mostarda', per: 1, unit: 'colher sopa', kcal: 12, protein: 0.6, carb: 1, fat: 0.6, gramsPerUnit: 15 },
  { name: 'Molho barbecue', per: 1, unit: 'colher sopa', kcal: 30, protein: 0.2, carb: 7, fat: 0.1, gramsPerUnit: 18 },
  { name: 'Molho pesto', per: 1, unit: 'colher sopa', kcal: 71, protein: 1, carb: 1, fat: 7, gramsPerUnit: 15 },
  { name: 'Geleia de frutas', per: 1, unit: 'colher sopa', kcal: 50, protein: 0.1, carb: 12.5, fat: 0, gramsPerUnit: 20 },
  { name: 'Açúcar refinado', per: 1, unit: 'colher sopa', kcal: 48, protein: 0, carb: 12, fat: 0, gramsPerUnit: 12 },
  { name: 'Açúcar refinado (colher chá)', per: 1, unit: 'colher chá', kcal: 16, protein: 0, carb: 4, fat: 0, gramsPerUnit: 4 },
];

/**
 * EXTRA block — Pratos típicos, salgados e lanches.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_PRATOS_TIPICOS_SALGADOS_E_LANCHES: FoodDbItem[] = [
  { name: 'Esfiha de queijo', per: 1, unit: 'unid', kcal: 193, protein: 6, carb: 22, fat: 9, gramsPerUnit: 80 },
  { name: 'Empada de palmito', per: 1, unit: 'unid', kcal: 203, protein: 4, carb: 22, fat: 11 },
  { name: 'Enroladinho de salsicha', per: 1, unit: 'unid', kcal: 259, protein: 7, carb: 24, fat: 15, gramsPerUnit: 90 },
  { name: 'Acarajé', per: 1, unit: 'unid', kcal: 256, protein: 9, carb: 19, fat: 16 },
  { name: 'Vatapá', per: 100, unit: 'g', kcal: 150, protein: 6, carb: 9, fat: 10 },
  { name: 'Pamonha', per: 1, unit: 'unid', kcal: 168, protein: 3, carb: 30, fat: 4, gramsPerUnit: 100 },
  { name: 'Curau de milho', per: 100, unit: 'g', kcal: 123, protein: 3, carb: 20, fat: 3.5 },
  { name: 'Arroz-doce', per: 100, unit: 'g', kcal: 128, protein: 2.5, carb: 24, fat: 2.5 },
  { name: 'Pizza margherita (fatia)', per: 1, unit: 'fatia', kcal: 249, protein: 11, carb: 31, fat: 9 },
  { name: 'Pizza de frango com catupiry (fatia)', per: 1, unit: 'fatia', kcal: 280, protein: 12, carb: 32, fat: 11 },
  { name: 'Parmegiana de carne', per: 100, unit: 'g', kcal: 219, protein: 18, carb: 12, fat: 11 },
  { name: 'Coxinha de frango com catupiry', per: 1, unit: 'unid', kcal: 240, protein: 9, carb: 23, fat: 13 },
  { name: 'Salgadinho de milho (100 g)', per: 100, unit: 'g', kcal: 516, protein: 6, carb: 60, fat: 28 },
  { name: 'Batata chips (100 g)', per: 100, unit: 'g', kcal: 539, protein: 6, carb: 50, fat: 35 },
  { name: 'Amendoim japonês', per: 100, unit: 'g', kcal: 477, protein: 12, carb: 60, fat: 21 },
];

/**
 * EXTRA block — Doces e sobremesas.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_DOCES_E_SOBREMESAS: FoodDbItem[] = [
  { name: 'Paçoca', per: 1, unit: 'unid', kcal: 107, protein: 3.2, carb: 10, fat: 6, gramsPerUnit: 20 },
  { name: 'Pé de moleque', per: 1, unit: 'unid', kcal: 105, protein: 2.5, carb: 12, fat: 5.2, gramsPerUnit: 20 },
  { name: 'Cocada', per: 1, unit: 'unid', kcal: 106, protein: 0.5, carb: 16, fat: 4.5, gramsPerUnit: 30 },
  { name: 'Beijinho', per: 1, unit: 'unid', kcal: 83, protein: 0.8, carb: 11, fat: 4, gramsPerUnit: 20 },
  { name: 'Quindim', per: 1, unit: 'unid', kcal: 130, protein: 2, carb: 17, fat: 6, gramsPerUnit: 40 },
  { name: 'Goiabada (fatia)', per: 1, unit: 'fatia', kcal: 81, protein: 0.1, carb: 20, fat: 0, gramsPerUnit: 30 },
  { name: 'Churros recheado (doce de leite)', per: 1, unit: 'unid', kcal: 211, protein: 3, carb: 25, fat: 11, gramsPerUnit: 60 },
  { name: 'Picolé de fruta', per: 1, unit: 'unid', kcal: 48, protein: 0, carb: 12, fat: 0, gramsPerUnit: 60 },
  { name: 'Picolé cremoso (leite)', per: 1, unit: 'unid', kcal: 102, protein: 1.5, carb: 14, fat: 4.5, gramsPerUnit: 60 },
  { name: 'Chocolate ao leite', per: 100, unit: 'g', kcal: 537, protein: 7.7, carb: 59, fat: 30 },
  { name: 'Chocolate amargo 70%', per: 100, unit: 'g', kcal: 602, protein: 7.8, carb: 46, fat: 43 },
  { name: 'Bombom', per: 1, unit: 'unid', kcal: 76, protein: 1, carb: 9, fat: 4, gramsPerUnit: 15 },
  { name: 'Gelatina pronta (sabor fruta)', per: 100, unit: 'g', kcal: 61, protein: 1.2, carb: 14, fat: 0 },
  { name: 'Gelatina diet', per: 100, unit: 'g', kcal: 8, protein: 1.5, carb: 0.5, fat: 0 },
  { name: 'Brownie', per: 1, unit: 'unid', kcal: 232, protein: 3, carb: 28, fat: 12, gramsPerUnit: 50 },
  { name: 'Torta de limão (fatia)', per: 1, unit: 'fatia', kcal: 328, protein: 4, carb: 42, fat: 16, gramsPerUnit: 100 },
  { name: 'Donut', per: 1, unit: 'unid', kcal: 252, protein: 3.5, carb: 28, fat: 14, gramsPerUnit: 60 },
  { name: 'Bala de goma', per: 100, unit: 'g', kcal: 332, protein: 6, carb: 77, fat: 0 },
  { name: 'Sorvete de massa (100 g)', per: 100, unit: 'g', kcal: 207, protein: 3.5, carb: 24, fat: 11 },
];

/**
 * EXTRA block — Bebidas.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_BEBIDAS: FoodDbItem[] = [
  { name: 'Café preto sem açúcar (xícara)', per: 1, unit: 'xícara', kcal: 2, protein: 0.1, carb: 0, fat: 0, gramsPerUnit: 50 },
  { name: 'Café com açúcar (xícara)', per: 1, unit: 'xícara', kcal: 40, protein: 0.1, carb: 10, fat: 0, gramsPerUnit: 50 },
  { name: 'Chá sem açúcar (xícara)', per: 1, unit: 'xícara', kcal: 2, protein: 0, carb: 0.5, fat: 0, gramsPerUnit: 200 },
  { name: 'Chá gelado (copo)', per: 1, unit: 'copo', kcal: 60, protein: 0, carb: 15, fat: 0, gramsPerUnit: 200 },
  { name: 'Cappuccino (xícara)', per: 1, unit: 'xícara', kcal: 80, protein: 1.5, carb: 13, fat: 2.5, gramsPerUnit: 200 },
  { name: 'Refrigerante zero (lata)', per: 1, unit: 'lata', kcal: 1, protein: 0, carb: 0, fat: 0, gramsPerUnit: 350 },
  { name: 'Suco de uva integral (copo)', per: 1, unit: 'copo', kcal: 150, protein: 0.6, carb: 37, fat: 0, gramsPerUnit: 200 },
  { name: 'Suco de maracujá com açúcar (copo)', per: 1, unit: 'copo', kcal: 110, protein: 0.7, carb: 27, fat: 0.1, gramsPerUnit: 200 },
  { name: 'Suco de caixinha (200 ml)', per: 1, unit: 'copo', kcal: 100, protein: 0, carb: 24, fat: 0, gramsPerUnit: 200 },
  { name: 'Suco verde (copo 300 ml)', per: 1, unit: 'copo', kcal: 60, protein: 2, carb: 12, fat: 0.5, gramsPerUnit: 300 },
  { name: 'Vitamina de banana com leite (copo)', per: 1, unit: 'copo', kcal: 200, protein: 7, carb: 33, fat: 4.5, gramsPerUnit: 300 },
  { name: 'Isotônico (500 ml)', per: 1, unit: 'garrafa', kcal: 120, protein: 0, carb: 30, fat: 0, gramsPerUnit: 500 },
  { name: 'Energético (lata 250 ml)', per: 1, unit: 'lata', kcal: 112, protein: 0.8, carb: 27, fat: 0, gramsPerUnit: 250 },
  { name: 'Cerveja sem álcool (lata)', per: 1, unit: 'lata', kcal: 64, protein: 1, carb: 15, fat: 0, gramsPerUnit: 350 },
  { name: 'Chopp (copo 300 ml)', per: 1, unit: 'copo', kcal: 130, protein: 1, carb: 10, fat: 0, gramsPerUnit: 300 },
  { name: 'Vodka (dose 50 ml)', per: 1, unit: 'dose', kcal: 110, protein: 0, carb: 0, fat: 0, gramsPerUnit: 50 },
  { name: 'Cachaça (dose 50 ml)', per: 1, unit: 'dose', kcal: 110, protein: 0, carb: 0, fat: 0, gramsPerUnit: 50 },
  { name: 'Whisky (dose 50 ml)', per: 1, unit: 'dose', kcal: 112, protein: 0, carb: 0, fat: 0, gramsPerUnit: 50 },
  { name: 'Espumante (taça)', per: 1, unit: 'taça', kcal: 90, protein: 0.2, carb: 2, fat: 0, gramsPerUnit: 120 },
  { name: 'Leite com chocolate (copo)', per: 1, unit: 'copo', kcal: 151, protein: 6, carb: 24, fat: 3.5, gramsPerUnit: 200 },
  { name: 'Chocolate quente (xícara)', per: 1, unit: 'xícara', kcal: 187, protein: 7, carb: 24, fat: 7, gramsPerUnit: 200 },
  { name: 'Kombucha (copo)', per: 1, unit: 'copo', kcal: 30, protein: 0, carb: 7, fat: 0, gramsPerUnit: 250 },
  { name: 'Caldo de cana (copo 300 ml)', per: 1, unit: 'copo', kcal: 200, protein: 0.5, carb: 50, fat: 0, gramsPerUnit: 300 },
];

/**
 * EXTRA block — Suplementos, barras e industrializados.
 * HONESTY NOTE: values below are written from the author's knowledge of TACO/USDA
 * tables (per 100 g or per stated unit); they were NOT looked up online and are
 * approximations (typical preparation, no brand). Checked offline by
 * scripts/validate-nutrition-data.mjs (finite numbers, kcal ~ 4P+4C+9F).
 */
const FOOD_DB_EXTRA_SUPLEMENTOS_BARRAS_E_INDUSTRIALIZADOS: FoodDbItem[] = [
  { name: 'Whey isolado (1 scoop 30 g)', per: 1, unit: 'scoop', kcal: 109, protein: 25, carb: 1, fat: 0.5, gramsPerUnit: 30 },
  { name: 'Caseína (1 scoop 33 g)', per: 1, unit: 'scoop', kcal: 122, protein: 24, carb: 3, fat: 1.5, gramsPerUnit: 33 },
  { name: 'Albumina (1 scoop 30 g)', per: 1, unit: 'scoop', kcal: 104, protein: 24, carb: 2, fat: 0, gramsPerUnit: 30 },
  { name: 'Hipercalórico (1 dose 100 g)', per: 1, unit: 'dose', kcal: 378, protein: 15, carb: 75, fat: 2, gramsPerUnit: 100 },
  { name: 'Barra de proteína', per: 1, unit: 'unid', kcal: 210, protein: 15, carb: 22, fat: 7, gramsPerUnit: 50 },
  { name: 'Barra de cereal', per: 1, unit: 'unid', kcal: 90, protein: 1, carb: 16, fat: 2.5, gramsPerUnit: 22 },
  { name: 'Proteína de soja texturizada (crua)', per: 100, unit: 'g', kcal: 330, protein: 50, carb: 27, fat: 1 },
  { name: 'Tempeh', per: 100, unit: 'g', kcal: 192, protein: 20, carb: 7.6, fat: 10.8 },
  { name: 'Hambúrguer vegetal (soja/grão-de-bico)', per: 100, unit: 'g', kcal: 193, protein: 14, carb: 14, fat: 9 },
  { name: 'Seitan', per: 100, unit: 'g', kcal: 142, protein: 25, carb: 6, fat: 2 },
  { name: 'Pasta de amendoim integral (100 g)', per: 100, unit: 'g', kcal: 588, protein: 25, carb: 20, fat: 50 },
  { name: 'Aveia em flocos (colher sopa)', per: 1, unit: 'colher sopa', kcal: 39, protein: 1.3, carb: 6.6, fat: 0.7, gramsPerUnit: 10 },
  { name: 'Granola (colher sopa)', per: 1, unit: 'colher sopa', kcal: 67, protein: 1.5, carb: 9.5, fat: 2.5, gramsPerUnit: 15 },
  { name: 'Leite condensado light', per: 1, unit: 'colher sopa', kcal: 45, protein: 1.5, carb: 8, fat: 1, gramsPerUnit: 20 },
];

export const FOOD_DB: FoodDbItem[] = [
  ...FOOD_DB_BASE,
  ...FOOD_DB_EXTRA_CARNES_BOVINAS_SUINAS_AVES_E_EMBUTIDOS,
  ...FOOD_DB_EXTRA_OVOS,
  ...FOOD_DB_EXTRA_PEIXES_E_FRUTOS_DO_MAR,
  ...FOOD_DB_EXTRA_LATICINIOS_E_QUEIJOS,
  ...FOOD_DB_EXTRA_PAES_BISCOITOS_E_MASSAS_DE_CAFE_DA_MANHA,
  ...FOOD_DB_EXTRA_ARROZ_FEIJOES_MASSAS_E_TUBERCULOS,
  ...FOOD_DB_EXTRA_FRUTAS,
  ...FOOD_DB_EXTRA_VERDURAS_LEGUMES_E_CONSERVAS,
  ...FOOD_DB_EXTRA_CASTANHAS_SEMENTES_GORDURAS_E_MOLHOS,
  ...FOOD_DB_EXTRA_PRATOS_TIPICOS_SALGADOS_E_LANCHES,
  ...FOOD_DB_EXTRA_DOCES_E_SOBREMESAS,
  ...FOOD_DB_EXTRA_BEBIDAS,
  ...FOOD_DB_EXTRA_SUPLEMENTOS_BARRAS_E_INDUSTRIALIZADOS,
];
